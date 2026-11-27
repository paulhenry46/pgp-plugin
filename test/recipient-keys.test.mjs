import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const outDir = 'node_modules/.cache/pgp-plugin-tests';
await mkdir(outDir, { recursive: true });
const outfile = `${outDir}/recipient-keys.mjs`;
await build({
  entryPoints: ['src/pgp/key-utils.ts'],
  bundle: true,
  outfile,
  format: 'esm',
  platform: 'node',
  logLevel: 'silent',
  external: ['openpgp', 'hash-wasm'],
  alias: { '@plugin-host': './test/stubs/plugin-host.mjs' },
});
const { forgetUnencryptedSendConsent, rememberUnencryptedSendConsent, takeUnencryptedSendConsent } = await import(pathToFileURL(outfile).href);

test('a consent is used once for the same sender and recipients', () => {
  rememberUnencryptedSendConsent('me@example.org', ['Alice@example.org', 'bob@example.org']);
  assert.equal(takeUnencryptedSendConsent('Me@example.org', ['bob@example.org', 'alice@example.org']), true);
  assert.equal(takeUnencryptedSendConsent('me@example.org', ['bob@example.org', 'alice@example.org']), false);
});

test('a consent does not cover other recipients', () => {
  rememberUnencryptedSendConsent('me@example.org', ['alice@example.org', 'bob@example.org']);
  assert.equal(takeUnencryptedSendConsent('me@example.org', ['alice@example.org', 'carol@example.org']), false);
});

test('a consent does not cover another sender', () => {
  rememberUnencryptedSendConsent('me@example.org', ['alice@example.org']);
  assert.equal(takeUnencryptedSendConsent('other@example.org', ['alice@example.org']), false);
  assert.equal(takeUnencryptedSendConsent('me@example.org', ['alice@example.org']), true);
});

test('two pending sends keep their own consent', () => {
  rememberUnencryptedSendConsent('me@example.org', ['alice@example.org']);
  rememberUnencryptedSendConsent('me@example.org', ['carol@example.org']);
  assert.equal(takeUnencryptedSendConsent('me@example.org', ['alice@example.org']), true);
  assert.equal(takeUnencryptedSendConsent('me@example.org', ['carol@example.org']), true);
});

test('a new send check drops an unused consent for the same send', () => {
  rememberUnencryptedSendConsent('me@example.org', ['alice@example.org']);
  forgetUnencryptedSendConsent('Me@example.org', ['Alice@example.org']);
  assert.equal(takeUnencryptedSendConsent('me@example.org', ['alice@example.org']), false);
});

test('an old consent expires', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 0 });
  rememberUnencryptedSendConsent('me@example.org', ['alice@example.org']);
  t.mock.timers.tick(10 * 60 * 1000 + 1);
  assert.equal(takeUnencryptedSendConsent('me@example.org', ['alice@example.org']), false);
});
