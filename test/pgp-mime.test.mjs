import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import * as openpgp from 'openpgp';

// Bundle only the pure parser functions so the tests run with Node, without a
// browser, JMAP credentials, or access to private OpenPGP key material.
async function loadParser(entryPoint) {
  const { outputFiles } = await build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
  });
  const source = Buffer.from(outputFiles[0].contents).toString('base64');
  return import(`data:text/javascript;base64,${source}`);
}

const { detectPgp } = await loadParser('src/pgp/detect.ts');
const { normalizePgpMessage } = await loadParser('src/pgp/normalize.ts');

const marker = {
  type: 'application/pgp-encrypted',
  name: 'Attachment.pgp-encrypted',
  blobId: 'marker-12b',
  partId: '1',
  size: 12,
};
const ciphertext = {
  type: 'application/octet-stream',
  name: 'encrypted.asc',
  blobId: 'encrypted-18k',
  partId: '2',
  size: 18_000,
};
const container = {
  type: 'multipart/encrypted',
  blobId: 'whole-message',
  subParts: [marker, ciphertext],
};

function detect(contentType, structure, attachments) {
  return detectPgp(contentType, structure, null, attachments, '');
}

test('RFC 3156 with quoted protocol selects ciphertext, not root MIME blob', () => {
  const result = detect(
    'multipart/encrypted; protocol="application/pgp-encrypted"; boundary="x"',
    container,
    [marker, ciphertext],
  );
  assert.equal(result.type, 'pgp-mime-encrypted');
  assert.equal(result.blobId, 'encrypted-18k');
  assert.equal(result.partId, '2');
});

test('RFC 3156 with unquoted protocol is detected', () => {
  const result = detect('multipart/encrypted; protocol=application/pgp-encrypted', container, []);
  assert.equal(result.blobId, 'encrypted-18k');
});

test('PGP/MIME attachments fallback picks ciphertext when Content-Type is absent', () => {
  const result = detect('', null, [marker, ciphertext]);
  assert.equal(result.type, 'pgp-mime-encrypted');
  assert.equal(result.blobId, 'encrypted-18k');
});

test('PGP/MIME attachments fallback supports missing body structure', () => {
  const result = detect('multipart/encrypted; protocol=application/pgp-encrypted', null, [marker, ciphertext]);
  assert.equal(result.blobId, 'encrypted-18k');
});

test('nested MIME structure picks octet-stream payload', () => {
  const root = { type: 'multipart/mixed', subParts: [container] };
  const result = detect('', root, []);
  assert.equal(result.blobId, 'encrypted-18k');
});

test('control-only application/pgp-encrypted is not decryptable', () => {
  assert.equal(detect('', marker, []).type, null);
  assert.equal(detect('', null, [marker]).type, null);
});

test('standalone PGP .asc attachment remains supported', () => {
  const result = detect('', null, [{ type: 'application/octet-stream', name: 'message.asc', blobId: 'standalone' }]);
  assert.equal(result.type, 'pgp-encrypted-file');
  assert.equal(result.blobId, 'standalone');
});

test('signed MIME remains a signed message', () => {
  const signed = {
    type: 'multipart/signed',
    blobId: 'signed-root',
    subParts: [{ type: 'application/pgp-signature', blobId: 'signature' }],
  };
  const result = detect('multipart/signed; protocol="application/pgp-signature"', signed, []);
  assert.equal(result.type, 'pgp-mime-signed');
  assert.equal(result.signatureBlobId, 'signature');
});

test('armored message is extracted from the MIME wrapper', () => {
  const armor = [
    '-----BEGIN PGP MESSAGE-----', '', 'SGVsbG8=', '-----END PGP MESSAGE-----',
  ].join('\r\n');
  const mime = [
    'MIME-Version: 1.0',
    'Content-Type: multipart/encrypted; boundary="xyz"',
    '', '--xyz', 'Content-Type: application/pgp-encrypted',
    '', 'Version: 1', '--xyz',
    'Content-Type: application/octet-stream; name="encrypted.asc"',
    '', armor, '--xyz--', '',
  ].join('\r\n');
  assert.equal(normalizePgpMessage(new TextEncoder().encode(mime)), armor);
});

test('an actual encrypted RFC 3156 payload decrypts after extracting armor', async () => {
  // Ephemeral test-only keys: no account data, secrets or network calls.
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'ecc',
    curve: 'curve25519',
    userIDs: [{ name: 'PGP MIME Test', email: 'test@example.invalid' }],
  });
  const plaintext = 'PGP/MIME regression test';
  const armor = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: plaintext }),
    encryptionKeys: await openpgp.readKey({ armoredKey: publicKey }),
  });
  const wrapped = [
    'MIME-Version: 1.0',
    'Content-Type: multipart/encrypted; protocol="application/pgp-encrypted"; boundary="b"',
    '', '--b', 'Content-Type: application/pgp-encrypted',
    '', 'Version: 1', '--b', 'Content-Type: application/octet-stream',
    '', armor, '--b--',
  ].join('\r\n');
  const normalized = normalizePgpMessage(new TextEncoder().encode(wrapped));
  const message = await openpgp.readMessage({ armoredMessage: normalized });
  const { data } = await openpgp.decrypt({
    message,
    decryptionKeys: await openpgp.readPrivateKey({ armoredKey: privateKey }),
  });
  assert.equal(data, plaintext);
});

test('bare armor and base64 fallback remain supported', () => {
  const armor = '-----BEGIN PGP MESSAGE-----\n\nSGVsbG8=\n-----END PGP MESSAGE-----';
  assert.equal(normalizePgpMessage(armor), armor);
  assert.equal(normalizePgpMessage('Version: 1'), 'Version: 1');
  assert.equal(
    normalizePgpMessage('U29tZSBhcm1vcmxlc3MgYmFzZTY0IGVuY3J5cHRlZCBiaW5hcnkgYmxvYg=='),
    '-----BEGIN PGP MESSAGE-----\n\nU29tZSBhcm1vcmxlc3MgYmFzZTY0IGVuY3J5cHRlZCBiaW5hcnkgYmxvYg==\n-----END PGP MESSAGE-----',
  );
});
