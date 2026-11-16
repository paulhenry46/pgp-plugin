import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as openpgp from 'openpgp';

// Bundles a module with '@plugin-host' replaced by test/stubs/plugin-host.mjs.
// Written under node_modules/.cache (not a data: URL) so the external openpgp
// and hash-wasm resolve from node_modules: openpgp's Node build needs a file URL.
const outDir = 'node_modules/.cache/pgp-plugin-tests';
async function load(entryPoint) {
  await mkdir(outDir, { recursive: true });
  const outfile = `${outDir}/${basename(entryPoint, '.ts')}.mjs`;
  await build({
    entryPoints: [entryPoint],
    bundle: true,
    outfile,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    external: ['openpgp', 'hash-wasm'],
    alias: { '@plugin-host': './test/stubs/plugin-host.mjs' },
  });
  return import(pathToFileURL(outfile).href);
}

const { keyAddressFor } = await load('src/pgp/key-address.ts');
const { scanAndImportKeysFromAttachments } = await load('src/pgp/key-utils.ts');
const stub = globalThis.__pluginHostStub;

async function publicKey(...emails) {
  const { publicKey } = await openpgp.generateKey({
    type: 'ecc',
    curve: 'curve25519Legacy',
    userIDs: emails.map((email) => ({ email })),
    format: 'armored',
  });
  return publicKey;
}

const keyFile = (armored) => ({ name: 'key.asc', contentType: 'application/pgp-keys', content: armored });
const savedKeys = (address) => stub.contacts
  .filter((c) => Object.values(c.emails || {}).some((e) => e.address === address))
  .flatMap((c) => Object.values(c.cryptoKeys || {}));

beforeEach(() => {
  stub.contacts = [];
  stub.settings = {};
  stub.storage = {};
  stub.confirms = [];
  stub.confirmAnswer = true;
});

test('keyAddressFor binds a key to the expected address only', () => {
  assert.equal(keyAddressFor(['Alice@Example.org', 'a@work.example'], ' alice@example.org '), 'alice@example.org');
  assert.equal(keyAddressFor(['a@work.example', 'alice@example.org'], 'alice@example.org'), 'alice@example.org');
  assert.equal(keyAddressFor(['ceo@example.com'], 'attacker@evil.example'), null);
  assert.equal(keyAddressFor([], 'alice@example.org'), null);
  assert.equal(keyAddressFor(['alice@example.org'], ''), null);
});

test('a key attached for the sender is saved once the user agrees', async () => {
  await scanAndImportKeysFromAttachments([keyFile(await publicKey('alice@example.org'))], 'Alice@Example.org');
  assert.equal(stub.confirms.length, 1);
  assert.match(stub.confirms[0].message, /"email":"alice@example.org"/);
  assert.match(stub.confirms[0].message, /"fingerprint":"[0-9A-Fa-f:]{20,}"/);
  assert.equal(savedKeys('alice@example.org').length, 1);
});

// A forged From looks exactly like this to the plugin: the answer is the user's.
test('nothing is saved when the user declines, and that key is not offered again', async () => {
  const forged = [keyFile(await publicKey('ceo@example.com'))];
  stub.confirmAnswer = false;
  await scanAndImportKeysFromAttachments(forged, 'ceo@example.com');
  assert.equal(stub.contacts.length, 0);
  stub.confirmAnswer = true;
  await scanAndImportKeysFromAttachments(forged, 'ceo@example.com');
  assert.equal(stub.confirms.length, 1);
  assert.equal(stub.contacts.length, 0);
});

test('a key for another address is not saved, and not offered', async () => {
  await scanAndImportKeysFromAttachments([keyFile(await publicKey('ceo@example.com'))], 'attacker@evil.example');
  assert.equal(stub.confirms.length, 0);
  assert.equal(stub.contacts.length, 0);
});

test('a key for the sender is saved under the sender, not its first User ID', async () => {
  await scanAndImportKeysFromAttachments(
    [keyFile(await publicKey('ceo@example.com', 'attacker@evil.example'))], 'attacker@evil.example');
  assert.equal(savedKeys('ceo@example.com').length, 0);
  assert.equal(savedKeys('attacker@evil.example').length, 1);
});

test('an attached key never joins a key already saved for the sender', async () => {
  await scanAndImportKeysFromAttachments([keyFile(await publicKey('bob@example.org'))], 'bob@example.org');
  await scanAndImportKeysFromAttachments([keyFile(await publicKey('bob@example.org'))], 'bob@example.org');
  assert.equal(stub.confirms.length, 1);
  assert.equal(savedKeys('bob@example.org').length, 1);
});

test('nothing is saved or offered when the setting is off', async () => {
  stub.settings = { autoImportSignerCerts: false };
  await scanAndImportKeysFromAttachments([keyFile(await publicKey('alice@example.org'))], 'alice@example.org');
  assert.equal(stub.confirms.length, 0);
  assert.equal(stub.contacts.length, 0);
});

test('a file with two keys is saved as the one key that was shown', async () => {
  const shown = await publicKey('dave@example.org');
  const hidden = await publicKey('someone@else.example');
  await scanAndImportKeysFromAttachments([keyFile(`${shown}\n${hidden}`)], 'dave@example.org');
  const [saved] = savedKeys('dave@example.org');
  const armored = Buffer.from(saved.uri.split(',')[1], 'base64').toString();
  const keys = await openpgp.readKeys({ armoredKeys: armored });
  assert.equal(keys.length, 1);
  assert.equal(keys[0].getFingerprint(), (await openpgp.readKey({ armoredKey: shown })).getFingerprint());
  assert.equal(armored.match(/BEGIN PGP PUBLIC KEY BLOCK/g).length, 1);
});

test('a key saved for the sender while the question is open is not joined', async () => {
  const earlier = await publicKey('erin@example.org');
  // The user answers yes, but a key reached the contact in the meantime.
  Object.defineProperty(stub, 'confirmAnswer', {
    configurable: true,
    get() {
      stub.contacts.push({
        id: 'c9',
        emails: { p: { address: 'erin@example.org' } },
        cryptoKeys: { first: { uri: `data:application/pgp-keys;base64,${Buffer.from(earlier).toString('base64')}`, mediaType: 'application/pgp-keys' } },
      });
      return true;
    },
  });
  try {
    await scanAndImportKeysFromAttachments([keyFile(await publicKey('erin@example.org'))], 'erin@example.org');
  } finally {
    Object.defineProperty(stub, 'confirmAnswer', { configurable: true, writable: true, value: true });
  }
  assert.equal(stub.confirms.length, 1);
  assert.deepEqual(Object.keys(stub.contacts[0].cryptoKeys), ['first']);
  assert.equal(savedKeys('erin@example.org').length, 1);
});
