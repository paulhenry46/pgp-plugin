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
// activate(), so it starts the listener) and a settings slot frame. In a
// browser the slot frame finds the background frame among parent.frames;
// here both copies share one global, which stands for both windows.
globalThis.parent = { frames: [globalThis] };
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

// Any other script of the origin, in any tab: it listens to and talks on the channel.
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
  assert.deepEqual(seen, [{ type: 'KEY_UPDATED', isUnlocked: true }]);
  assert.equal((await background.fetchKeyFromBackground('k1'))?.signingKey, 'SECRET-ONE');
});

test('a key unlocked in a settings frame reaches the background frame, not the channel', async () => {
  seen.length = 0;
  slot.broadcastUnlockKey(entry('k2', 'SECRET-TWO'));
  slot.broadcastInitializeRamIndex({ m1: { preview: 'SECRET-PREVIEW', tokens: ['secretword'] } });
  slot.broadcastUpdateRamIndexEntry('m2', { preview: 'SECRET-PREVIEW-2', tokens: ['otherword'] });
  await settle();
  assert.deepEqual(seen, [{ type: 'KEY_UPDATED', isUnlocked: true }]);
  assert.equal((await background.fetchKeyFromBackground('k2'))?.signingKey, 'SECRET-TWO');
  assert.deepEqual(await background.fetchPreviewsBatchFromBackground(['m1', 'm2']), { m1: 'SECRET-PREVIEW', m2: 'SECRET-PREVIEW-2' });
  assert.deepEqual(await background.executeSearchInBackground('secretword'), ['m1']);
});

test('a settings frame reads whether a key is unlocked, never the key', async () => {
  assert.equal(await slot.isKeyUnlockedInBackground('k2'), true);
  assert.equal(await slot.isKeyUnlockedInBackground('nope'), false);
  assert.equal(await slot.checkIsKeyUnlocked(), true);
  assert.equal(await slot.fetchKeyFromBackground('k2'), null);
  assert.deepEqual(await slot.fetchPreviewsBatchFromBackground(['m1']), {});
  assert.deepEqual(await slot.executeSearchInBackground('secretword'), []);
  assert.deepEqual(Object.keys(globalThis.__pgpSessionHost).sort(), ['initIndex', 'isUnlocked', 'setKey', 'updateIndexEntry']);
});

test('the channel hands out nothing', async () => {
  seen.length = 0;
  outsider.postMessage({ type: 'REQUEST_KEY_DATA', requestId: 'r1', keyId: 'k1' });
  outsider.postMessage({ type: 'REQUEST_KEY_STATUS', requestId: 'r2', keyId: 'k1' });
  outsider.postMessage({ type: 'PING_STATUS', requestId: 'r3' });
  outsider.postMessage({ type: 'REQUEST_PREVIEWS_BATCH', requestId: 'r4', emailIds: ['m1'] });
  outsider.postMessage({ type: 'REQUEST_SEARCH', requestId: 'r5', query: 'secretword' });
  outsider.postMessage({ type: 'GET_RAM_INDEX', requestId: 'r6' });
  await settle();
  assert.deepEqual(seen, []);
});

test('nothing pushed on the channel is stored', async () => {
  outsider.postMessage({ type: 'SET_KEY', keyEntry: entry('k1', 'ATTACKER-KEY') });
  outsider.postMessage({ type: 'SET_KEY', keyEntry: entry('k9', 'ATTACKER-KEY') });
  outsider.postMessage({ type: 'INITIALIZE_RAM_INDEX', decryptedIndex: { m1: { preview: 'FAKE', tokens: [] } } });
  outsider.postMessage({ type: 'UPDATE_RAM_INDEX_ENTRY', id: 'm2', payload: { preview: 'FAKE', tokens: [] } });
  await settle();
  assert.equal((await background.fetchKeyFromBackground('k1'))?.signingKey, 'SECRET-ONE');
  assert.equal(await background.fetchKeyFromBackground('k9'), null);
  assert.deepEqual(await background.fetchPreviewsBatchFromBackground(['m1', 'm2']), { m1: 'SECRET-PREVIEW', m2: 'SECRET-PREVIEW-2' });
});

test('locking from a settings frame clears the key in the background frame', async () => {
  slot.broadcastLockKey('k2');
  await settle();
  assert.equal(await background.fetchKeyFromBackground('k2'), null);
  assert.equal(await slot.isKeyUnlockedInBackground('k2'), false);
});

test('without a background frame in the tab, a settings frame sends the key nowhere', async () => {
  globalThis.parent = { frames: [] };
  seen.length = 0;
  slot.broadcastUnlockKey(entry('k3', 'SECRET-THREE'));
  await settle();
  assert.deepEqual(seen, []);
  assert.equal(await background.fetchKeyFromBackground('k3'), null);
  assert.equal(await slot.isKeyUnlockedInBackground('k1'), false);
  globalThis.parent = { frames: [globalThis] };
});
