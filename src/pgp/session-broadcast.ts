import { getPreview, search } from '../cache.ts';
import { config, settings } from '../shared.ts';
import { DecryptedCachePayload, getPluginData, listKeyRecords, savePluginData, SessionKeysEntry } from '../storage.ts';
import { deriveSecret } from './key-utils.ts';
import { loadDangerousPassphrases, getKeyRecord } from '../storage.ts';
import { unlockPrivateKey } from './import.ts'; 
const CHANNEL_NAME = 'pgp-session-bus';

// The unlocked keys and the decrypted index live in the background frame,
// where activate() and every hook run. A BroadcastChannel reaches every
// script of the webmail's origin, in every tab, not only this plugin's
// frames: so the channel never hands out key material, previews or search
// results. Code in the background frame reads them directly; a slot frame
// (settings) may only push a key it unlocked and ask whether a key is
// unlocked.
let _isSessionHost = false;
let _backgroundSessionKeys: Record<string, SessionKeysEntry> = {};
let _ramDecryptedIndex: Record<string, { preview: string, tokens: string[] }> = {};

type SessionMessage =
  | { type: 'PING_STATUS'; requestId: string }
  | { type: 'PONG_STATUS'; requestId: string; isUnlocked: boolean }
  | { type: 'SET_KEY'; keyEntry: SessionKeysEntry }
  | { type: 'KEY_UPDATED'; isUnlocked: boolean }
  | { type: 'CLEAR_KEY'; id: string }
  | { type: 'REQUEST_KEY_STATUS'; requestId: string; keyId: string }
  | { type: 'RESPONSE_KEY_STATUS'; requestId: string; isUnlocked: boolean }
  | { type: 'INITIALIZE_RAM_INDEX'; decryptedIndex: Record<string, DecryptedCachePayload> }
  | { type: 'GET_RAM_INDEX'; requestId: string }
  | { type: 'RESPONSE_RAM_INDEX'; requestId: string; decryptedIndex: Record<string, DecryptedCachePayload> }
  | { type: 'UPDATE_RAM_INDEX_ENTRY'; id: string; payload: DecryptedCachePayload }
  | { type: 'REQUEST_ADD_CUSTOM_SECRET'; requestId: string; salt: string; accountId: string; data: any }
  | { type: 'RESPONSE_ADD_CUSTOM_SECRET'; requestId: string; ok: boolean; }
  | { type: 'REQUEST_CUSTOM_SECRET'; requestId: string; salt: string; accountId: string }
  | { type: 'RESPONSE_CUSTOM_SECRET'; requestId: string; secret: string | null; data: any | undefined; };

function notifyKeyUpdated(isUnlocked: boolean): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'KEY_UPDATED', isUnlocked });
  channel.close();
}

export function initBackgroundSessionListener(): void {
  _isSessionHost = true;
  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = (event: MessageEvent<SessionMessage>) => {
    const msg = event.data;

    switch (msg.type) {
      case 'PING_STATUS':
        channel.postMessage({
          type: 'PONG_STATUS',
          requestId: msg.requestId,
          isUnlocked: Object.keys(_backgroundSessionKeys).length > 0
        });
        break;

      case 'SET_KEY':
        _backgroundSessionKeys[msg.keyEntry.id] = msg.keyEntry;
        channel.postMessage({ type: 'KEY_UPDATED', isUnlocked: true });
        break;

      case 'CLEAR_KEY':
        // remove keyId from _backgroundSessionKeys if provided, otherwise clear all keys
        if (msg.id) {
          delete _backgroundSessionKeys[msg.id];
        }else{
          _backgroundSessionKeys = {};
        }
        channel.postMessage({ type: 'KEY_UPDATED', isUnlocked: false });
        break;
    
      // Whether a key is unlocked, never the key itself.
      case 'REQUEST_KEY_STATUS':
        channel.postMessage({
          type: 'RESPONSE_KEY_STATUS',
          requestId: msg.requestId,
          isUnlocked: !!_backgroundSessionKeys[msg.keyId]
        });
        break;

      case 'INITIALIZE_RAM_INDEX':
        // add instead of replacing to avoid overwriting existing entries and allowing for multiple keys to contribute to the index
        _ramDecryptedIndex = { ..._ramDecryptedIndex, ...msg.decryptedIndex };
        break;

      case 'UPDATE_RAM_INDEX_ENTRY':
      _ramDecryptedIndex[msg.id] = msg.payload;
      break;
      case 'REQUEST_CUSTOM_SECRET': {

        (async () => {
        const allKeys = await listKeyRecords();
        const defaultKey = allKeys.find((k) => k.default === true && k.accountId === msg.accountId);

          if (!defaultKey) {
            return;
          }
         const hmacKey = _backgroundSessionKeys[defaultKey.id]?.hmacKey;
         if (!hmacKey) {
            channel.postMessage({
              type: 'RESPONSE_CUSTOM_SECRET',
              requestId: msg.requestId,
              secret: null
            });
            return;
          }
        const secret = await deriveSecret(hmacKey, msg.salt);
        const data = await getPluginData(msg.salt, msg.accountId);
        
        channel.postMessage({
          type: 'RESPONSE_CUSTOM_SECRET',
          requestId: msg.requestId,
          secret: secret,
          data: data
        });
        })();
        break;
      }

      case 'REQUEST_ADD_CUSTOM_SECRET': {
        (async () => {
          let ok = false;
          try {
            const allKeys = await listKeyRecords();
            const defaultKey = allKeys.find(k => k.default === true && k.accountId === msg.accountId);
            const unlocked = defaultKey && _backgroundSessionKeys[defaultKey.id]?.hmacKey;
            if (unlocked && !(await getPluginData(msg.salt, msg.accountId))) {
              await savePluginData(msg.salt, msg.data, msg.accountId); 
              ok = true;
            }
          } catch (e) { console.error(e); }
          channel.postMessage({ type: 'RESPONSE_ADD_CUSTOM_SECRET', requestId: msg.requestId, ok });
        })();
        break;
      }
    }
  };
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

/** Whether a key is unlocked in the background frame; safe from any frame. */
export function isKeyUnlockedInBackground(keyId: string): Promise<boolean> {
  if (_isSessionHost) return Promise.resolve(!!_backgroundSessionKeys[keyId]);
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = Math.random().toString(36).substring(2);

    const timeout = setTimeout(() => {
      channel.close();
      resolve(false);
    }, 300);

    channel.onmessage = (event: MessageEvent<SessionMessage>) => {
      if (event.data.type === 'RESPONSE_KEY_STATUS' && event.data.requestId === requestId) {
        clearTimeout(timeout);
        channel.close();
        resolve(event.data.isUnlocked);
      }
    };

    channel.postMessage({ type: 'REQUEST_KEY_STATUS', requestId, keyId });
  });
}

export function checkIsKeyUnlocked(): Promise<boolean> {
  if (_isSessionHost) return Promise.resolve(Object.keys(_backgroundSessionKeys).length > 0);
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = Math.random().toString(36).substring(2);

    const timeout = setTimeout(() => {
      channel.close();
      resolve(false);
    }, 300);

    channel.onmessage = (event: MessageEvent<SessionMessage>) => {
      if (event.data.type === 'PONG_STATUS' && event.data.requestId === requestId) {
        clearTimeout(timeout);
        channel.close();
        resolve(event.data.isUnlocked);
      }
    };

    channel.postMessage({ type: 'PING_STATUS', requestId });
  });
}

/**
 * Hands an unlocked key to the background frame. Unlocked there (startup,
 * decrypt and send prompts, persisted keys), it is stored directly and only
 * the status goes out. Unlocked in a slot frame (settings), it still has to
 * cross the channel once.
 */
export function broadcastUnlockKey(keyEntry: SessionKeysEntry): void {
  if (_isSessionHost) {
    _backgroundSessionKeys[keyEntry.id] = keyEntry;
    notifyKeyUpdated(true);
    return;
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'SET_KEY', keyEntry });
  channel.close();
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
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'INITIALIZE_RAM_INDEX', decryptedIndex });
  channel.close();
}

export function fetchRamIndexFromBackground(): Promise<Record<string, DecryptedCachePayload>> {
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = Math.random().toString(36).substring(2);

    const timeout = setTimeout(() => {
      channel.close();
      resolve({});
    }, 1000);

    channel.onmessage = (event: MessageEvent<SessionMessage>) => {
      if (event.data.type === 'RESPONSE_RAM_INDEX' && event.data.requestId === requestId) {
        clearTimeout(timeout);
        channel.close();
        resolve(event.data.decryptedIndex);
      }
    };

    channel.postMessage({ type: 'GET_RAM_INDEX', requestId });
  });
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
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'UPDATE_RAM_INDEX_ENTRY', id, payload });
  channel.close();
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
        decryptionKey ,
        aesKey: aesKey,
        hmacKey: hmacKey
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