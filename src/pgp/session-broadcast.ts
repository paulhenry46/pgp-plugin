import { DecryptedCachePayload, SessionKeysEntry } from '../storage.ts';

const CHANNEL_NAME = 'pgp-session-bus';

let _backgroundSessionKeys: Record<string, SessionKeysEntry> = {};
let _ramDecryptedIndex: Record<string, { preview: string, tokens: string[] }> = {};

type SessionMessage =
  | { type: 'PING_STATUS'; requestId: string }
  | { type: 'PONG_STATUS'; requestId: string; isUnlocked: boolean }
  | { type: 'SET_KEY'; keyEntry: SessionKeysEntry }
  | { type: 'KEY_UPDATED'; isUnlocked: boolean }
  | { type: 'CLEAR_KEY' }
  | { type: 'REQUEST_KEY_DATA'; requestId: string; keyId: string }
  | { type: 'RESPONSE_KEY_DATA'; requestId: string; keyEntry: SessionKeysEntry | null }
  | { type: 'INITIALIZE_RAM_INDEX'; decryptedIndex: Record<string, DecryptedCachePayload> }
  | { type: 'REQUEST_PREVIEWS_BATCH'; requestId: string; emailIds: string[] }
  | { type: 'RESPONSE_PREVIEWS_BATCH'; requestId: string; previews: Record<string, string> }
  | { type: 'REQUEST_SEARCH'; requestId: string; query: string }
  | { type: 'RESPONSE_SEARCH'; requestId: string; matchingIds: string[] }
  | { type: 'UPDATE_RAM_INDEX_ENTRY'; id: string; payload: DecryptedCachePayload };

export function initBackgroundSessionListener(): void {
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
        _backgroundSessionKeys = {};
        channel.postMessage({ type: 'KEY_UPDATED', isUnlocked: false });
        break;
    
      case 'REQUEST_KEY_DATA':
        channel.postMessage({
          type: 'RESPONSE_KEY_DATA',
          requestId: msg.requestId,
          keyEntry: _backgroundSessionKeys[msg.keyId] || null
        });
        break;

      case 'INITIALIZE_RAM_INDEX':
        _ramDecryptedIndex = msg.decryptedIndex;
        console.log(`[Background] Index RAM initialisé avec ${Object.keys(msg.decryptedIndex).length} messages.`);
        break;

      // 2. Traitement groupé des demandes de previews depuis le webmail
      case 'REQUEST_PREVIEWS_BATCH': {
        const previewsResult: Record<string, string> = {};
        for (const id of msg.emailIds) {
          if (_ramDecryptedIndex[id]) {
            previewsResult[id] = _ramDecryptedIndex[id].preview;
          }
        }
        channel.postMessage({
          type: 'RESPONSE_PREVIEWS_BATCH',
          requestId: msg.requestId,
          previews: previewsResult
        });
        break;
      }

      // 3. Moteur de recherche exécuté directement côté Background RAM
      case 'REQUEST_SEARCH': {
        const cleanedQuery = msg.query.toLowerCase().trim(); // Normalisation basique
        const matchingIds: string[] = [];

        if (cleanedQuery) {
          for (const [id, data] of Object.entries(_ramDecryptedIndex)) {
            // Recherche par correspondance de jetons (Tokens)
            const matches = data.tokens.some(token => token.includes(cleanedQuery));
            if (matches) {
              matchingIds.push(id);
            }
          }
        }

        channel.postMessage({
          type: 'RESPONSE_SEARCH',
          requestId: msg.requestId,
          matchingIds
        });
        break;
      }
      case 'UPDATE_RAM_INDEX_ENTRY':
      _ramDecryptedIndex[msg.id] = msg.payload;
      console.log(`[Background] Entrée RAM mise à jour pour le mail : ${msg.id}`);
      console.log(_ramDecryptedIndex);
      break;
    }
  };
}

export function getBackgroundSessionKey(id: string): SessionKeysEntry | null {
  return _backgroundSessionKeys[id] || null;
}

export function fetchKeyFromBackground(keyId: string): Promise<SessionKeysEntry | null> {
    console.log('fetchKeyFromBackground called for keyId:', keyId);
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = Math.random().toString(36).substring(2);

    const timeout = setTimeout(() => {
      channel.close();
      resolve(null);
    }, 300);

    channel.onmessage = (event: MessageEvent<SessionMessage>) => {
      if (event.data.type === 'RESPONSE_KEY_DATA' && event.data.requestId === requestId) {
        clearTimeout(timeout);
        channel.close();
        resolve(event.data.keyEntry);
      }
    };

    channel.postMessage({ type: 'REQUEST_KEY_DATA', requestId, keyId });
    console.log('fetchKeyFromBackground request sent for keyId:', keyId);
  });
}

export function checkIsKeyUnlocked(): Promise<boolean> {
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = Math.random().toString(36).substring(2);

    const timeout = setTimeout(() => {
      channel.close();
      resolve(false);
    }, 250);

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

export function broadcastUnlockKey(keyEntry: SessionKeysEntry): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'SET_KEY', keyEntry });
  channel.close();
}

export function broadcastLockKey(): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'CLEAR_KEY' });
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
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'INITIALIZE_RAM_INDEX', decryptedIndex });
  channel.close();
}

export function fetchPreviewsBatchFromBackground(emailIds: string[]): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = Math.random().toString(36).substring(2);

    const timeout = setTimeout(() => {
      channel.close();
      resolve({});
    }, 300); // Protection anti-blocage

    channel.onmessage = (event: MessageEvent<SessionMessage>) => {
      const msg = event.data;
      if (msg.type === 'RESPONSE_PREVIEWS_BATCH' && msg.requestId === requestId) {
        clearTimeout(timeout);
        channel.close();
        resolve(msg.previews);
      }
    };

    channel.postMessage({ type: 'REQUEST_PREVIEWS_BATCH', requestId, emailIds });
  });
}

export function executeSearchInBackground(query: string): Promise<string[]> {
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = Math.random().toString(36).substring(2);

    const timeout = setTimeout(() => {
      channel.close();
      resolve([]);
    }, 500);

    channel.onmessage = (event: MessageEvent<SessionMessage>) => {
      const msg = event.data;
      if (msg.type === 'RESPONSE_SEARCH' && msg.requestId === requestId) {
        clearTimeout(timeout);
        channel.close();
        resolve(msg.matchingIds);
      }
    };

    channel.postMessage({ type: 'REQUEST_SEARCH', requestId, query });
  });
}

export function broadcastUpdateRamIndexEntry(id: string, payload: DecryptedCachePayload): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'UPDATE_RAM_INDEX_ENTRY', id, payload });
  channel.close();
}