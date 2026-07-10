import { SessionKeysEntry } from '../storage.ts';

const CHANNEL_NAME = 'pgp-session-bus';

let _backgroundSessionKeys: Record<string, SessionKeysEntry> = {};

type SessionMessage =
  | { type: 'PING_STATUS'; requestId: string }
  | { type: 'PONG_STATUS'; requestId: string; isUnlocked: boolean }
  | { type: 'SET_KEY'; keyEntry: SessionKeysEntry }
  | { type: 'KEY_UPDATED'; isUnlocked: boolean }
  | { type: 'CLEAR_KEY' }
  | { type: 'REQUEST_KEY_DATA'; requestId: string; keyId: string }
  | { type: 'RESPONSE_KEY_DATA'; requestId: string; keyEntry: SessionKeysEntry | null };

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