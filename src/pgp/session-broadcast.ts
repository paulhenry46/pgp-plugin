import { getPreview, search } from '../cache.ts';
import { config, settings } from '../shared.ts';
import { DecryptedCachePayload, getPluginData, listKeyRecords, savePluginData, SessionKeysEntry } from '../storage.ts';
import { deriveSecret } from './key-utils.ts';
import { loadDangerousPassphrases, getKeyRecord } from '../storage.ts';
import { unlockPrivateKey } from './import.ts'; 
export const CHANNEL_NAME = 'pgp-session-bus';

// The unlocked keys and the decrypted index live in the background frame,
// where activate() and every hook run. A BroadcastChannel reaches every
// script of the webmail's origin, in every tab and worker, not only this
// plugin's frames: so no key, preview or search result ever travels on the
// channel, in either direction, and nothing received on it is stored. Code
// in the background frame reads keys and index directly. A slot frame
// (settings) hands over a key it unlocked by calling the background frame of
// its own tab (see SessionHost). The channel carries the "a key changed"
// notice, the lock request and the custom-secret API.
let _isSessionHost = false;
let _backgroundSessionKeys: Record<string, SessionKeysEntry> = {};
let _ramDecryptedIndex: Record<string, { preview: string, tokens: string[] }> = {};

interface CustomSecretResult {
  secret: string | null;
  data?: any;
}

/**
 * What the background frame offers the plugin's other frames, as an object
 * on its own window. Frames of one tab and one origin can call each other,
 * so nothing is posted anywhere. It takes keys in and answers yes or no: it
 * has no way to read a key, a preview or a search result back out.
 */
interface SessionHost {
  setKey(keyEntry: SessionKeysEntry): void;
  isUnlocked(keyId?: string): boolean;
  initIndex(decryptedIndex: Record<string, DecryptedCachePayload>): void;
  updateIndexEntry(id: string, payload: DecryptedCachePayload): void;
  getCustomSecret(salt: string, accountId: string): Promise<CustomSecretResult>;
  addCustomSecret(salt: string, accountId: string, data: any): Promise<boolean>;
}

const SESSION_HOST_PROP = '__pgpSessionHost';
const SESSION_HOST_METHODS = [
  'setKey',
  'isUnlocked',
  'initIndex',
  'updateIndexEntry',
  'getCustomSecret',
  'addCustomSecret',
] as const;

/**
 * The background frame of this tab, looked up among the page's frames.
 *
 * A window also answers a property name with the element of its document
 * that has that id or name. The webmail shows a message in a frame of its own
 * origin (scripts off), so the sender's HTML can put an element called
 * __pgpSessionHost in front of the real one. Markup cannot make functions:
 * only an object whose four members are functions is taken, the rest is
 * skipped.
 */
function findSessionHost(): SessionHost | null {
  let frames: any;
  try {
    frames = (globalThis as any).parent?.frames;
  } catch {
    return null;
  }
  const count = Number(frames?.length) || 0;
  for (let i = 0; i < count; i++) {
    try {
      const candidate = frames[i]?.[SESSION_HOST_PROP];
      if (candidate && SESSION_HOST_METHODS.every((name) => typeof candidate[name] === 'function')) {
        return candidate as SessionHost;
      }
    } catch {
      // A frame of another origin: not ours.
    }
  }
  return null;
}

type SessionMessage =
  | { type: 'KEY_UPDATED'; isUnlocked: boolean }
  | { type: 'CLEAR_KEY'; id: string };

function notifyKeyUpdated(isUnlocked: boolean): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'KEY_UPDATED', isUnlocked });
  channel.close();
}

export function initBackgroundSessionListener(): void {
  _isSessionHost = true;

  // structuredClone: what a slot frame hands over is copied into this frame,
  // so it outlives the slot frame (settings closes, the keys stay).
  const sessionHost: SessionHost = Object.freeze({
    setKey(keyEntry: SessionKeysEntry) {
      _backgroundSessionKeys[keyEntry.id] = structuredClone(keyEntry);
      notifyKeyUpdated(true);
    },
    isUnlocked(keyId?: string) {
      return keyId ? !!_backgroundSessionKeys[keyId] : Object.keys(_backgroundSessionKeys).length > 0;
    },
    initIndex(decryptedIndex: Record<string, DecryptedCachePayload>) {
      _ramDecryptedIndex = { ..._ramDecryptedIndex, ...structuredClone(decryptedIndex) };
    },
    updateIndexEntry(id: string, payload: DecryptedCachePayload) {
      _ramDecryptedIndex[id] = structuredClone(payload);
    },
    async getCustomSecret(salt: string, accountId: string): Promise<CustomSecretResult> {
      const allKeys = await listKeyRecords();
      const defaultKey = allKeys.find((k) => k.default === true && k.accountId === accountId);

      if (!defaultKey) {
        return { secret: null };
      }

      const hmacKey = _backgroundSessionKeys[defaultKey.id]?.hmacKey;
      if (!hmacKey) {
        return { secret: null };
      }

      const secret = await deriveSecret(hmacKey, salt);
      const data = await getPluginData(salt, accountId);

      return structuredClone({ secret, data });
    },
    async addCustomSecret(salt: string, accountId: string, data: any): Promise<boolean> {
      try {
        const allKeys = await listKeyRecords();
        const defaultKey = allKeys.find((k) => k.default === true && k.accountId === accountId);
        const unlocked = defaultKey && _backgroundSessionKeys[defaultKey.id]?.hmacKey;

        if (unlocked && !(await getPluginData(salt, accountId))) {
          await savePluginData(salt, structuredClone(data), accountId);
          return true;
        }
      } catch (e) {
        console.error('[PGP] Error adding custom secret:', e);
      }
      return false;
    },
  });

  Object.defineProperty(globalThis, SESSION_HOST_PROP, { value: sessionHost, configurable: true });

  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = (event: MessageEvent<SessionMessage>) => {
    const msg = event.data;

    if (msg.type === 'CLEAR_KEY') {
      // remove keyId from _backgroundSessionKeys if provided, otherwise clear all keys
      if (msg.id) {
        delete _backgroundSessionKeys[msg.id];
      } else {
        _backgroundSessionKeys = {};
      }
      channel.postMessage({ type: 'KEY_UPDATED', isUnlocked: false });
    }
  };
}

export async function requestCustomSecret(salt: string, accountId: string): Promise<CustomSecretResult> {
  const host = _isSessionHost ? (globalThis as any)[SESSION_HOST_PROP] : findSessionHost();
  if (!host) return { secret: null };
  return host.getCustomSecret(salt, accountId);
}

export async function requestAddCustomSecret(salt: string, accountId: string, data: any): Promise<boolean> {
  const host = _isSessionHost ? (globalThis as any)[SESSION_HOST_PROP] : findSessionHost();
  if (!host) return false;
  return host.addCustomSecret(salt, accountId, data);
}

export function getBackgroundSessionKey(id: string): SessionKeysEntry | null {
  return _backgroundSessionKeys[id] || null;
}

/**
 * The unlocked key, for code running in the background frame (hooks). The
 * key never crosses the channel, so a slot frame gets null: use
 * isKeyUnlockedInBackground() there.
 */
export async function fetchKeyFromBackground(keyId: string): Promise<SessionKeysEntry | null> {
  return _isSessionHost ? (_backgroundSessionKeys[keyId] || null) : null;
}

/**
 * Whether a key is unlocked in the background frame of this tab; safe from
 * any frame.
 */
export async function isKeyUnlockedInBackground(keyId: string): Promise<boolean> {
  if (_isSessionHost) return !!_backgroundSessionKeys[keyId];
  return findSessionHost()?.isUnlocked(keyId) ?? false;
}

export async function checkIsKeyUnlocked(): Promise<boolean> {
  if (_isSessionHost) return Object.keys(_backgroundSessionKeys).length > 0;
  return findSessionHost()?.isUnlocked() ?? false;
}

/**
 * Hands an unlocked key to the background frame. Unlocked there (startup,
 * decrypt and send prompts, persisted keys), it is stored directly. Unlocked
 * in a slot frame (settings), it is passed to the background frame of the
 * same tab by a direct call. Either way only "a key changed" goes out on the
 * channel.
 */
export function broadcastUnlockKey(keyEntry: SessionKeysEntry): void {
  if (_isSessionHost) {
    _backgroundSessionKeys[keyEntry.id] = keyEntry;
    notifyKeyUpdated(true);
    return;
  }
  const sessionHost = findSessionHost();
  if (!sessionHost) {
    console.warn('[PGP] No background frame found in this tab: the key stays locked.');
    return;
  }
  sessionHost.setKey(keyEntry);
}

export function broadcastLockKey(keyId: string): void {
  if (_isSessionHost) {
    delete _backgroundSessionKeys[keyId];
    notifyKeyUpdated(false);
    return;
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'CLEAR_KEY', id: keyId });
  channel.close();
}

export function subscribeToKeyUpdates(callback: (isUnlocked: boolean) => void): () => void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent<SessionMessage>) => {
    if (event.data.type === 'KEY_UPDATED') {
      callback(event.data.isUnlocked);
    }
  };
  return () => channel.close();
}

export function broadcastInitializeRamIndex(decryptedIndex: Record<string, DecryptedCachePayload>): void {
  if (_isSessionHost) {
    _ramDecryptedIndex = { ..._ramDecryptedIndex, ...decryptedIndex };
    return;
  }
  findSessionHost()?.initIndex(decryptedIndex);
}

// Previews and search read decrypted mail: background frame only (the
// onEmailsFetched and onSearchResults hooks), never over the channel.
export async function fetchPreviewsBatchFromBackground(emailIds: string[]): Promise<Record<string, string>> {
  return _isSessionHost ? getPreview(emailIds, _ramDecryptedIndex) : {};
}

export async function executeSearchInBackground(query: string): Promise<string[]> {
  return _isSessionHost ? search(query, _ramDecryptedIndex) : [];
}

export function broadcastUpdateRamIndexEntry(id: string, payload: DecryptedCachePayload): void {
  if (_isSessionHost) {
    _ramDecryptedIndex[id] = payload;
    return;
  }
  findSessionHost()?.updateIndexEntry(id, payload);
}

export async function restoreKeysFromDangerousStorage(): Promise<void> {
  if (!settings().StoreDangerous || !(await config('allowPersistentKeys') === true)) return;

  try {
    const passphrases = await loadDangerousPassphrases();
    const keyIds = Object.keys(passphrases);

    if (keyIds.length > 0) {
      for (const keyId of keyIds) {
        const rec = await getKeyRecord(keyId);
        if (rec) {
          // This naturally calls `getIndex` inside unlockPrivateKey and loads RAM
          const { unlockedPrivateKey, signingKey, decryptionKey, aesKey, hmacKey } = await unlockPrivateKey(rec, passphrases[keyId], true);
          broadcastUnlockKey({ 
            id: rec.id, 
            unlockedPrivateKey, 
            signingKey, 
            decryptionKey,
            aesKey,
            hmacKey
          });
        }
      }
      // Broadcast unlock status to other listeners
      notifyKeyUpdated(true);
    }
  } catch (err) {
    console.error('Failed to auto-unlock keys from dangerous storage:', err);
  }
}