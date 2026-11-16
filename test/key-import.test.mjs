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
});

test('keyAddressFor binds a key to the expected address only', () => {
  assert.equal(keyAddressFor(['Alice@Example.org', 'a@work.example'], ' alice@example.org '), 'alice@example.org');
  assert.equal(keyAddressFor(['a@work.example', 'alice@example.org'], 'alice@example.org'), 'alice@example.org');
  assert.equal(keyAddressFor(['ceo@example.com'], 'attacker@evil.example'), null);
  assert.equal(keyAddressFor([], 'alice@example.org'), null);
  assert.equal(keyAddressFor(['alice@example.org'], ''), null);
});

test('a key attached by the sender for their own address is saved', async () => {
  await scanAndImportKeysFromAttachments([keyFile(await publicKey('alice@example.org'))], 'Alice@Example.org');
  assert.equal(savedKeys('alice@example.org').length, 1);
});

test('a key for another address is not saved', async () => {
  await scanAndImportKeysFromAttachments([keyFile(await publicKey('ceo@example.com'))], 'attacker@evil.example');
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
  assert.equal(savedKeys('bob@example.org').length, 1);
});

test('nothing is saved when auto-save is off', async () => {
  stub.settings = { autoImportSignerCerts: false };
  await scanAndImportKeysFromAttachments([keyFile(await publicKey('alice@example.org'))], 'alice@example.org');
  assert.equal(stub.contacts.length, 0);
});
