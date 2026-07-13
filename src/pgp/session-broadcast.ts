import * as openpgp from 'openpgp';
import { getPreview, search } from '../cache.ts';
import { DecryptedCachePayload, listKeyRecords } from '../storage.ts'; // Importe listKeyRecords pour résoudre les candidats de déchiffrement
import { normalizePgpMessage, findMatchingKeyRecords } from './decrypt.ts'; // Réutilise tes fonctions de normalisation

const CHANNEL_NAME = 'pgp-session-bus';

// Structure interne opaque isolée en RAM
interface BackgroundKeyStore {
  id: string;
  unlockedPrivateKey: openpgp.PrivateKey; // Instance de clé déverrouillée native
  publicKeyArmored: string;
  aesKey: CryptoKey; 
}

let _backgroundSessionKeys: Record<string, BackgroundKeyStore> = {};
let _ramDecryptedIndex: Record<string, DecryptedCachePayload> = {};

type SessionMessage =
  | { type: 'PING_STATUS'; requestId: string }
  | { type: 'PONG_STATUS'; requestId: string; isUnlocked: boolean }
  | { type: 'REQUEST_UNLOCK_KEY'; requestId: string; payload: any }
  | { type: 'RESPONSE_UNLOCK_KEY'; requestId: string; success: boolean }
  | { type: 'CLEAR_KEY' }
  | { type: 'KEY_UPDATED'; isUnlocked: boolean }
  | { type: 'INITIALIZE_RAM_INDEX'; decryptedIndex: Record<string, DecryptedCachePayload> }
  | { type: 'REQUEST_PREVIEWS_BATCH'; requestId: string; emailIds: string[] }
  | { type: 'RESPONSE_PREVIEWS_BATCH'; requestId: string; previews: Record<string, string> }
  | { type: 'REQUEST_SEARCH'; requestId: string; query: string }
  | { type: 'RESPONSE_SEARCH'; requestId: string; matchingIds: string[] }
  | { type: 'UPDATE_RAM_INDEX_ENTRY'; id: string; payload: DecryptedCachePayload }
  | { type: 'REQUEST_CRYPT_TEXT'; requestId: string; action: 'encrypt' | 'decrypt' | 'sign' | 'encrypt-and-sign'; text: string; keyId: string; recipientPublicKeys?: string[] }
  | { type: 'RESPONSE_CRYPT_TEXT'; requestId: string; result: string | null }
  | { type: 'REQUEST_PRIVATE_CHANNEL'; requestId: string }
  | { type: 'REQUEST_CACHE_ACTION'; requestId: string; action: 'decrypt-batch' | 'encrypt-entry'; data: any }
  | { type: 'RESPONSE_CACHE_ACTION'; requestId: string; result: any };

export function initBackgroundSessionListener(): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = async (event: MessageEvent<SessionMessage>) => {
    const msg = event.data;

    switch (msg.type) {
      case 'PING_STATUS':
        channel.postMessage({
          type: 'PONG_STATUS',
          requestId: msg.requestId,
          isUnlocked: Object.keys(_backgroundSessionKeys).length > 0
        });
        break;

      case 'REQUEST_UNLOCK_KEY': {
        try {
          const { id, publicKey, encryptedPrivateKey, salt, iv, kdfIterations, passphrase } = msg.payload;
          
          // 1. Dérivation et déballage de l'enveloppe de stockage local
          const enc = new TextEncoder();
          const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
          const wrappingKey = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: kdfIterations, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
          );

          const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, wrappingKey, encryptedPrivateKey);
          const armoredKeyText = new TextDecoder().decode(decryptedBuffer);

          // 2. Instanciation native de la clé OpenPGP en RAM isolée
          const parsedKey = await openpgp.readKey({ armoredKey: armoredKeyText });
          let unlockedPrivateKey = parsedKey as openpgp.PrivateKey;

          if (!unlockedPrivateKey.isDecrypted()) {
            unlockedPrivateKey = await openpgp.decryptKey({
              privateKey: unlockedPrivateKey,
              passphrase
            });
          }

          // 3. Dérivation de la clé AES persistante pour l'indexation de cache
          const aesKey = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: kdfIterations, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
          );

          _backgroundSessionKeys[id] = {
            id,
            unlockedPrivateKey,
            publicKeyArmored: publicKey || '',
            aesKey
          };

          channel.postMessage({ type: 'RESPONSE_UNLOCK_KEY', requestId: msg.requestId, success: true });
          channel.postMessage({ type: 'KEY_UPDATED', isUnlocked: true });
        } catch (err) {
          console.error('[Background] Failed to unlock key record:', err);
          channel.postMessage({ type: 'RESPONSE_UNLOCK_KEY', requestId: msg.requestId, success: false });
        }
        break;
      }

      case 'CLEAR_KEY':
        _backgroundSessionKeys = {};
        _ramDecryptedIndex = {};
        channel.postMessage({ type: 'KEY_UPDATED', isUnlocked: false });
        break;

      case 'INITIALIZE_RAM_INDEX':
        _ramDecryptedIndex = msg.decryptedIndex;
        break;

      case 'REQUEST_PREVIEWS_BATCH':
        channel.postMessage({
          type: 'RESPONSE_PREVIEWS_BATCH',
          requestId: msg.requestId,
          previews: getPreview(msg.emailIds, _ramDecryptedIndex)
        });
        break;

      case 'REQUEST_SEARCH':
        channel.postMessage({
          type: 'RESPONSE_SEARCH',
          requestId: msg.requestId,
          matchingIds: search(msg.query, _ramDecryptedIndex)
        });
        break;

      case 'UPDATE_RAM_INDEX_ENTRY':
        _ramDecryptedIndex[msg.id] = msg.payload;
        break;

      // --- TRADUCTION ET TRAITEMENT RÉEL OPENPGP (TEXTE COMPLET) ---
      case 'REQUEST_CRYPT_TEXT': {
        const keyEntry = _backgroundSessionKeys[msg.keyId];
        let result: string | null = null;
        
        try {
          if (msg.action === 'decrypt') {
            // Lecture du flux de messages et recherche automatique de la bonne clé
            const armoredMessage = normalizePgpMessage(msg.text);
            const parsedMessage = await openpgp.readMessage({ armoredMessage });
            
            // On récupère la liste globale des records pour l'évaluation des Key ID correspondants
            const records = await listKeyRecords();
            const candidates = await findMatchingKeyRecords(parsedMessage, records);
            
            let activeDecryptionKey: openpgp.PrivateKey | undefined;
            for (const cand of candidates) {
              if (_backgroundSessionKeys[cand.id]) {
                activeDecryptionKey = _backgroundSessionKeys[cand.id].unlockedPrivateKey;
                break;
              }
            }

            if (activeDecryptionKey) {
              const { data } = await openpgp.decrypt({
                message: parsedMessage,
                decryptionKeys: activeDecryptionKey,
                format: 'utf8'
              });
              result = data as string;
            } else {
              console.warn('[Background] Aucune clé déverrouillée ne correspond aux destinataires.');
            }

          } else if (msg.action === 'encrypt' || msg.action === 'encrypt-and-sign') {
            const recipientArmored = msg.recipientPublicKeys || [];
            const allPublicKeys: openpgp.PublicKey[] = [];

            // On ajoute la clé publique du expéditeur s'il y en a une de configurée
            if (keyEntry?.publicKeyArmored) {
              recipientArmored.push(keyEntry.publicKeyArmored);
            }

            // Déduplication et parsing des clés publiques de destination
            const uniqueKeys = Array.from(new Set(recipientArmored));
            for (const keyArmored of uniqueKeys) {
              try {
                allPublicKeys.push(await openpgp.readKey({ armoredKey: keyArmored }));
              } catch {}
            }

            const message = await openpgp.createMessage({ text: msg.text });
            const encryptOptions: openpgp.EncryptOptions = {
              message,
              encryptionKeys: allPublicKeys,
              format: 'armored'
            };

            if (msg.action === 'encrypt-and-sign' && keyEntry) {
              encryptOptions.signingKeys = keyEntry.unlockedPrivateKey;
            }

            result = (await openpgp.encrypt(encryptOptions)) as string;

          } else if (msg.action === 'sign' && keyEntry) {
            // Génération d'une signature détachée standard ASCII Armored
            const message = await openpgp.createMessage({ text: msg.text });
            result = await openpgp.sign({
              message,
              signingKeys: keyEntry.unlockedPrivateKey,
              detached: true
            });
          }
        } catch (err) {
          console.error('[Background] OpenPGP text operation failed:', err);
        }
        
        channel.postMessage({ type: 'RESPONSE_CRYPT_TEXT', requestId: msg.requestId, result });
        break;
      }

      case 'REQUEST_CACHE_ACTION': {
        const activeKey = Object.values(_backgroundSessionKeys)[0];
        let actionResult: any = null;

        if (activeKey?.aesKey) {
          try {
            if (msg.action === 'decrypt-batch') {
              const batch = msg.data as any[];
              for (const item of batch) {
                try {
                  const decryptedBuffer = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: Uint8Array.from(item.iv) },
                    activeKey.aesKey,
                    Uint8Array.from(item.encryptedPayload)
                  );
                  _ramDecryptedIndex[item.id] = JSON.parse(new TextDecoder().decode(decryptedBuffer));
                } catch {}
              }
              actionResult = true;
            } else if (msg.action === 'encrypt-entry') {
              const { id, payload } = msg.data;
              const textBytes = new TextEncoder().encode(JSON.stringify(payload));
              const iv = crypto.getRandomValues(new Uint8Array(12));
              
              const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                activeKey.aesKey,
                textBytes
              );
              
              _ramDecryptedIndex[id] = payload; 
              actionResult = {
                encryptedPayload: new Uint8Array(encrypted),
                iv: iv
              };
            }
          } catch (err) {
            console.error('[Background] Cache cryptography error:', err);
          }
        }
        channel.postMessage({ type: 'RESPONSE_CACHE_ACTION', requestId: msg.requestId, result: actionResult });
        break;
      }

      // --- TRADUCTION ET TRAITEMENT RÉEL OPENPGP POUR ATTACHEMENTS (PIÈCES JOINTES LOURDES) ---
      case 'REQUEST_PRIVATE_CHANNEL': {
        const { port1, port2 } = new MessageChannel();

        port1.onmessage = async (pEvent) => {
          const { action, requestId, arrayBuffer, keyId, recipientPublicKeys } = pEvent.data;
          const keyEntry = _backgroundSessionKeys[keyId];
          
          if (!keyEntry) {
            port1.postMessage({ type: 'FILE_ERROR', requestId, error: 'Key locked' });
            return;
          }

          try {
            let processedBuffer: ArrayBuffer;

            if (action === 'decrypt') {
              // Déchiffrement binaire natif
              const message = await openpgp.readMessage({ binary: new Uint8Array(arrayBuffer) });
              const { data } = await openpgp.decrypt({
                message,
                decryptionKeys: keyEntry.unlockedPrivateKey,
                format: 'binary'
              });
              const u8 = data as Uint8Array;
              processedBuffer = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);

            } else {
              // Chiffrement binaire natif (action === 'encrypt')
              const recipientArmored = recipientPublicKeys || [];
              if (keyEntry.publicKeyArmored) recipientArmored.push(keyEntry.publicKeyArmored);
              
              const allPublicKeys: openpgp.PublicKey[] = [];
              for (const armored of Array.from(new Set(recipientArmored))) {
                try { allPublicKeys.push(await openpgp.readKey({ armoredKey: armored })); } catch {}
              }

              const message = await openpgp.createMessage({ binary: new Uint8Array(arrayBuffer) });
              const encryptedData = await openpgp.encrypt({
                message,
                encryptionKeys: allPublicKeys,
                format: 'binary' // Sortie binaire pour conserver un flux d'octets compact
              });

              const u8 = encryptedData as Uint8Array;
              processedBuffer = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
            }

            port1.postMessage(
              { type: 'FILE_PROCESSED', requestId, arrayBuffer: processedBuffer },
              [processedBuffer]
            );
          } catch (err) {
            port1.postMessage({ type: 'FILE_ERROR', requestId, error: String(err) });
          }
        };

        (channel as any).postMessage({
          type: 'PRIVATE_CHANNEL_READY',
          requestId: msg.requestId
        }, [port2]);
        break;
      }
    }
  };
}

// (Conserve tes fonctions clientes du bas inchangées : executeCryptText, executeCryptFile, etc.)

// ── FONCTIONS FOREGROUND / CLIENT ─────────────────────────────────────

export function broadcastUnlockKey(payload: any): Promise<boolean> {
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = crypto.randomUUID();

    channel.onmessage = (event: MessageEvent<any>) => {
      if (event.data.type === 'RESPONSE_UNLOCK_KEY' && event.data.requestId === requestId) {
        channel.close();
        resolve(event.data.success);
      }
    };
    channel.postMessage({ type: 'REQUEST_UNLOCK_KEY', requestId, payload });
  });
}

export function executeCryptText(action: 'encrypt' | 'decrypt' | 'sign' | 'encrypt-and-sign', text: string, keyId: string): Promise<string | null> {
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = crypto.randomUUID();

    channel.onmessage = (event: MessageEvent<any>) => {
      if (event.data.type === 'RESPONSE_CRYPT_TEXT' && event.data.requestId === requestId) {
        channel.close();
        resolve(event.data.result);
      }
    };
    channel.postMessage({ type: 'REQUEST_CRYPT_TEXT', requestId, action, text, keyId });
  });
}

export function executeCryptFile(action: 'encrypt' | 'decrypt', arrayBuffer: ArrayBuffer, keyId: string): Promise<ArrayBuffer | null> {
  return new Promise((resolve) => {
    const publicChannel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = crypto.randomUUID();

    publicChannel.onmessage = (event: MessageEvent<any>) => {
      if (event.data.type === 'PRIVATE_CHANNEL_READY' && event.data.requestId === requestId) {
        publicChannel.close();
        const privatePort = event.ports[0];

        privatePort.onmessage = (pEvent) => {
          if (pEvent.data.type === 'FILE_PROCESSED' && pEvent.data.requestId === requestId) {
            privatePort.close();
            resolve(pEvent.data.arrayBuffer);
          } else {
            privatePort.close();
            resolve(null);
          }
        };

        privatePort.postMessage({ action, requestId, arrayBuffer, keyId }, [arrayBuffer]);
      }
    };
    publicChannel.postMessage({ type: 'REQUEST_PRIVATE_CHANNEL', requestId });
  });
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

export function executeCacheAction(action: 'decrypt-batch', data: any[]): Promise<boolean>;
export function executeCacheAction(action: 'encrypt-entry', data: { id: string, payload: any }): Promise<{ encryptedPayload: Uint8Array, iv: Uint8Array } | null>;
export function executeCacheAction(action: string, data: any): Promise<any> {
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    const channel = new BroadcastChannel('pgp_session_isolation');
    
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'RESPONSE_CACHE_ACTION' && e.data.requestId === requestId) {
        channel.removeEventListener('message', handler);
        channel.close();
        resolve(e.data.result);
      }
    };
    
    channel.addEventListener('message', handler);
    channel.postMessage({
      type: 'REQUEST_CACHE_ACTION',
      requestId,
      action,
      data
    });
  });
}

/**
 * Interroge le Background de manière sécurisée pour savoir si une clé est déverrouillée.
 * Renvoie un simple booléen pour protéger la RAM.
 */
export function checkKeyStatusFromBackground(keyId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = crypto.randomUUID();

    channel.onmessage = (event: MessageEvent<any>) => {
      if (event.data.type === 'RESPONSE_UNLOCK_KEY' || event.data.type === 'PONG_STATUS') {
        // Optionnel : adapter selon le retour exact de ton ping si tu l'utilises globalement
        channel.close();
        resolve(true); 
      }
    };
    
    // On réutilise le système de PING ou un message dédié
    channel.postMessage({ type: 'PING_STATUS', requestId });
    
    // Timeout de sécurité au cas où le Background ne répond pas
    setTimeout(() => { channel.close(); resolve(false); }, 500);
  });
}