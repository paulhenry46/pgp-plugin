import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Node's BroadcastChannel delivers between instances in one process, like
// frames of one origin in a browser. unref() so open channels (the
// background listener never closes) don't keep the test process alive.
const NativeChannel = globalThis.BroadcastChannel;
globalThis.BroadcastChannel = class extends NativeChannel {
  constructor(name) { super(name); this.unref?.(); }
};

// Two copies of the module stand for the background frame (it runs
// activate(), so it starts the listener) and a settings slot frame.
const outDir = 'node_modules/.cache/pgp-plugin-tests';
await mkdir(outDir, { recursive: true });
const outfile = `${outDir}/session-broadcast.mjs`;
await build({
  entryPoints: ['src/pgp/session-broadcast.ts'],
  bundle: true,
  outfile,
  format: 'esm',
  platform: 'node',
  logLevel: 'silent',
  external: ['openpgp', 'hash-wasm'],
  alias: { '@plugin-host': './test/stubs/plugin-host.mjs' },
});
const url = pathToFileURL(outfile).href;
const background = await import(`${url}?frame=background`);
const slot = await import(`${url}?frame=slot`);
background.initBackgroundSessionListener();

// Any other script of the origin: it listens to and talks on the channel.
const seen = [];
const outsider = new globalThis.BroadcastChannel('pgp-session-bus');
outsider.onmessage = (event) => seen.push(event.data);
after(() => outsider.close());

const settle = () => new Promise((resolve) => setTimeout(resolve, 400));
const leaks = (secret) => seen.filter((m) => JSON.stringify(m).includes(secret));
const entry = (id, secret) => ({
  id,
  unlockedPrivateKey: `-----BEGIN PGP PRIVATE KEY BLOCK----- ${secret}`,
  signingKey: secret,
  decryptionKey: secret,
});

test('a key unlocked in the background frame stays there', async () => {
  seen.length = 0;
  background.broadcastUnlockKey(entry('k1', 'SECRET-ONE'));
  await settle();
  assert.deepEqual(leaks('SECRET-ONE'), []);
  assert.deepEqual(seen, [{ type: 'KEY_UPDATED', isUnlocked: true }]);
  assert.equal((await background.fetchKeyFromBackground('k1'))?.signingKey, 'SECRET-ONE');
});

test('the channel does not hand out keys, previews or search results', async () => {
  background.broadcastInitializeRamIndex({ m1: { preview: 'SECRET-PREVIEW', tokens: ['secretword'] } });
  assert.deepEqual(await background.fetchPreviewsBatchFromBackground(['m1']), { m1: 'SECRET-PREVIEW' });
  assert.deepEqual(await background.executeSearchInBackground('secretword'), ['m1']);

  seen.length = 0;
  outsider.postMessage({ type: 'REQUEST_KEY_DATA', requestId: 'r1', keyId: 'k1' });
  outsider.postMessage({ type: 'REQUEST_PREVIEWS_BATCH', requestId: 'r2', emailIds: ['m1'] });
  outsider.postMessage({ type: 'REQUEST_SEARCH', requestId: 'r3', query: 'secretword' });
  outsider.postMessage({ type: 'GET_RAM_INDEX', requestId: 'r4' });
  await settle();
  assert.deepEqual(seen, []);
});

test('a settings frame can still unlock a key and read whether it is unlocked', async () => {
  slot.broadcastUnlockKey(entry('k2', 'SECRET-TWO'));
  await settle();
  assert.equal((await background.fetchKeyFromBackground('k2'))?.signingKey, 'SECRET-TWO');
  assert.equal(await slot.isKeyUnlockedInBackground('k2'), true);
  assert.equal(await slot.isKeyUnlockedInBackground('nope'), false);
  assert.equal(await slot.checkIsKeyUnlocked(), true);
  assert.equal(await slot.fetchKeyFromBackground('k2'), null);
});

test('locking from a settings frame clears the key in the background frame', async () => {
  slot.broadcastLockKey('k2');
  await settle();
  assert.equal(await background.fetchKeyFromBackground('k2'), null);
  assert.equal(await slot.isKeyUnlockedInBackground('k2'), false);
});
