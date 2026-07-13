/**
 * IndexedDB persistence for the OpenPGP plugin.
 *
 * Four stores:
 * - key-records:   encrypted-at-rest private keys + public keys (durable)
 * - public-certs:  recipient/contact public PGP keys (durable)
 * - session-keys:  unlocked OpenPGP private key objects (session-scoped)
 * - attachments:   email file attachments (durable) // only used when Atarchment + Draft are encrypted
 */
import host from '@plugin-host';
import { base64ToBuffer, bufferToBase64 } from "./util.ts";

const DB_NAME = 'pgp-plugin-store';
const DB_VERSION = 3;
const KEY_RECORDS_STORE = 'key-records';
const PUBLIC_CERTS_STORE = 'public-certs';
const SESSION_KEYS_STORE = 'session-keys';
const MESSAGE_CACHE_STORE = 'message-cache';

// ── Interfaces ──────────────────────────────────────

export interface KeyRecord {
  id: string;
  email: string;
  accountId?: string;
  publicKey: string;
  encryptedPrivateKey: ArrayBuffer; 
  salt: ArrayBuffer;                
  iv: ArrayBuffer;                  
  kdfIterations: number;            
  webauthn?: {
    credentialId: ArrayBuffer;     // ID du Passkey pour le retrouver via navigator.credentials.get
    encryptedPassphrase: ArrayBuffer; // La clé PGP chiffrée par le secret PRF
    iv: ArrayBuffer;               // Vecteur d'initialisation propre à ce chiffrement AES-GCM
  };          
  issuer: string;
  subject: string;
  serialNumber: string;             
  notBefore: string;                
  notAfter: string | null;          
  fingerprint: string;
  algorithm: string;
  capabilities: {
    canSign: boolean;
    canEncrypt: boolean;
  };
  default?: boolean;
}

export interface PublicCert {
  id: string;
  email: string;
  accountId?: string;
  publicKey: string;
  issuer: string;
  subject: string;
  notBefore: string;
  notAfter: string | null;
  fingerprint: string;
  source: string;
  default?: boolean;
}

export interface SessionKeysEntry {
  id: string; 
  unlockedPrivateKey: string; // ASCII Armored
  signingKey: string;          // ASCII Armored
  decryptionKey: string;       // ASCII Armored
  aesKey?: CryptoKey;
}

export interface EncryptedMessageCache {
  id: string; // ID du mail (ex: UID IMAP ou Message-ID)
  encryptedPayload: Uint8Array; // Contient le JSON { preview, tokens } chiffré en AES
  iv: Uint8Array; // IV unique pour ce mail précis
}

export interface DecryptedCachePayload {
  preview: string;
  tokens: string[];
}

// ── BDD ENGINE ───────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains(KEY_RECORDS_STORE)) {
        const keyStore = db.createObjectStore(KEY_RECORDS_STORE, { keyPath: 'id' });
        keyStore.createIndex('email', 'email', { unique: false });
        keyStore.createIndex('accountId', 'accountId', { unique: false });
      }
      if (!db.objectStoreNames.contains(PUBLIC_CERTS_STORE)) {
        const certStore = db.createObjectStore(PUBLIC_CERTS_STORE, { keyPath: 'id' });
        certStore.createIndex('email', 'email', { unique: false });
        certStore.createIndex('accountId', 'accountId', { unique: false });
      }
      if (!db.objectStoreNames.contains(SESSION_KEYS_STORE)) {
        db.createObjectStore(SESSION_KEYS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MESSAGE_CACHE_STORE)) {
        db.createObjectStore(MESSAGE_CACHE_STORE, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Encapsulate operation in promise.
 */
function txPromise<T>(
  db: IDBDatabase, 
  storeName: string, 
  mode: IDBTransactionMode, 
  fn: (store: IDBObjectStore) => IDBRequest
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

// ── Private Key Records CRUD ────────────────────────────────────────

export async function saveKeyRecord(record: KeyRecord): Promise<void> {
  const db = await openDB();
  await txPromise<IDBValidKey>(db, KEY_RECORDS_STORE, 'readwrite', (s) => s.put(record));
}

export async function getKeyRecord(id: string): Promise<KeyRecord | undefined> {
  const db = await openDB();
  return txPromise<KeyRecord | undefined>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.get(id));
}

export async function listKeyRecords(accountId?: string): Promise<KeyRecord[]> {
  const db = await openDB();
  const all = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
  if (!accountId) return all;
  return all.filter((r) => r.accountId === accountId || !r.accountId);
}

export async function getDefaultKeyRecord(): Promise<KeyRecord |undefined>{
  const db = await openDB();
  const all = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());

  return all.find((r) => r.default === true);
}

export async function deleteKeyRecord(id: string): Promise<void> {
  const db = await openDB();
  await txPromise<undefined>(db, KEY_RECORDS_STORE, 'readwrite', (s) => s.delete(id));
}

// ── Public Keys (Contacts) CRUD ─────────────────────────────────────

export async function savePublicCert(cert: PublicCert): Promise<void> {
  const db = await openDB();
  await txPromise<IDBValidKey>(db, PUBLIC_CERTS_STORE, 'readwrite', (s) => s.put(cert));
}

export async function listPublicCerts(email?: string): Promise<PublicCert[]> {
  const db = await openDB();
  const all = await txPromise<PublicCert[]>(db, PUBLIC_CERTS_STORE, 'readonly', (s) => s.getAll());
  if (!email) return all;
  return all.filter((c) => c.email === email || !c.email);
}

export async function deletePublicCert(id: string): Promise<void> {
  const db = await openDB();
  await txPromise<undefined>(db, PUBLIC_CERTS_STORE, 'readwrite', (s) => s.delete(id));
}

export async function setDefaultKeyRecord(targetId: string, isChecked: boolean): Promise<void> {
  const db = await openDB();
  const all = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
  
  await Promise.all(
    all.map((k) => {
      const isCurrent = k.id === targetId;
      return txPromise<IDBValidKey>(db, KEY_RECORDS_STORE, 'readwrite', (s) => 
        s.put({
          ...k,
          default: isCurrent ? isChecked : (isChecked ? false : k.default)
        })
      );
    })
  );
}

export async function getDefaultPublicKeyForEncryption(): Promise<string | undefined> {
  const db = await openDB();
  const allKeys = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
  const defaultPrivateKey = allKeys.find((k) => k.default === true);
  
  if (defaultPrivateKey) {
    return defaultPrivateKey.publicKey;
  }
  return undefined;
}

// ── CRUD pour le Message Cache Chiffré ───────────────────────────────

export async function saveMessageCache(cache: EncryptedMessageCache): Promise<void> {
  const db = await openDB();
  await txPromise<IDBValidKey>(db, MESSAGE_CACHE_STORE, 'readwrite', (s) => s.put(cache));
}

export async function getMessageCache(id: string): Promise<EncryptedMessageCache | undefined> {
  const db = await openDB();
  return txPromise<EncryptedMessageCache | undefined>(db, MESSAGE_CACHE_STORE, 'readonly', (s) => s.get(id));
}

export async function getAllMessageCache(): Promise<EncryptedMessageCache[]> {
  const db = await openDB();
  return txPromise<EncryptedMessageCache[]>(db, MESSAGE_CACHE_STORE, 'readonly', (s) => s.getAll());
}

export async function getMessageCacheBatch(ids: string[]): Promise<Record<string, EncryptedMessageCache>> {
  const db = await openDB();
  const tx = db.transaction(MESSAGE_CACHE_STORE, 'readonly');
  const store = tx.objectStore(MESSAGE_CACHE_STORE);
  
  const results: Record<string, EncryptedMessageCache> = {};
  
  // Batch processing natif IndexedDB
  await Promise.all(
    ids.map(id => {
      return new Promise<void>((resolve) => {
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result) results[id] = req.result;
          resolve();
        };
        req.onerror = () => resolve(); // On ignore silencieusement les erreurs individuelles
      });
    })
  );
  
  return results;
}

export async function clearAllMessageCache(): Promise<void> {
  const db = await openDB();
  await txPromise<undefined>(db, MESSAGE_CACHE_STORE, 'readwrite', (s) => s.clear());
}

export async function exportPluginData(): Promise<void> {
  try {
    const db = await openDB();
    
    // 1. Récupération de TOUTES les données durables + index/cache
    const rawKeys = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
    const rawCerts = await txPromise<PublicCert[]>(db, PUBLIC_CERTS_STORE, 'readonly', (s) => s.getAll());
    const rawCache = await txPromise<EncryptedMessageCache[]>(db, MESSAGE_CACHE_STORE, 'readonly', (s) => s.getAll());

    // 2. Sérialisation des buffers pour les clés privées (KeyRecords)
    const serializedKeys = rawKeys.map(key => ({
      ...key,
      encryptedPrivateKey: bufferToBase64(key.encryptedPrivateKey),
      salt: bufferToBase64(key.salt),
      iv: bufferToBase64(key.iv),
      webauthn: key.webauthn ? {
        credentialId: bufferToBase64(key.webauthn.credentialId),
        encryptedPassphrase: bufferToBase64(key.webauthn.encryptedPassphrase),
        iv: bufferToBase64(key.webauthn.iv),
      } : undefined
    }));

    // 3. Sérialisation des buffers pour l'index/cache (EncryptedMessageCache)
    const serializedCache = rawCache.map(item => ({
      id: item.id,
      encryptedPayload: bufferToBase64(item.encryptedPayload),
      iv: bufferToBase64(item.iv)
    }));

    // 4. Construction du package final de sauvegarde
    const backupPackage = {
      format: "openpgp-plugin-backup",
      version: DB_VERSION,
      createdAt: new Date().toISOString(),
      keys: serializedKeys,
      certs: rawCerts,
      messageCache: serializedCache // <--- Ajout de l'index ici
    };

    // 5. Génération et téléchargement du fichier JSON
    const jsonString = JSON.stringify(backupPackage, null, 2);
    await host.ui.downloadFile({
      content: jsonString,
      filename: `pgp_plugin_backup_${new Date().toISOString().split('T')[0]}.json`,
      contentType: 'application/json'
    });

  } catch (error) {
    throw new Error("Impossible d'exporter les données.");
  }
}

export async function importPluginData(jsonContent: string): Promise<void> {
  try {
    const backup = JSON.parse(jsonContent);

    // Validation du format (on vérifie la présence de keys, certs et maintenant de l'index)
    if (backup.format !== "openpgp-plugin-backup" || !backup.keys || !backup.certs || !backup.messageCache) {
      throw new Error("Fichier de sauvegarde invalide ou corrompu.");
    }

    const db = await openDB();

    // 1. Transaction et Import des KeyRecords
    const txKeys = db.transaction(KEY_RECORDS_STORE, 'readwrite');
    const storeKeys = txKeys.objectStore(KEY_RECORDS_STORE);
    for (const key of backup.keys) {
      const restoredKey: KeyRecord = {
        ...key,
        encryptedPrivateKey: base64ToBuffer(key.encryptedPrivateKey) as ArrayBuffer,
        salt: base64ToBuffer(key.salt) as ArrayBuffer,
        iv: base64ToBuffer(key.iv) as ArrayBuffer,
        webauthn: key.webauthn ? {
          credentialId: base64ToBuffer(key.webauthn.credentialId) as ArrayBuffer,
          encryptedPassphrase: base64ToBuffer(key.webauthn.encryptedPassphrase) as ArrayBuffer,
          iv: base64ToBuffer(key.webauthn.iv) as ArrayBuffer,
        } : undefined
      };
      storeKeys.put(restoredKey);
    }

    // 2. Transaction et Import des Certificats Publics (Contacts)
    const txCerts = db.transaction(PUBLIC_CERTS_STORE, 'readwrite');
    const storeCerts = txCerts.objectStore(PUBLIC_CERTS_STORE);
    for (const cert of backup.certs) {
      storeCerts.put(cert);
    }

    // 3. Transaction et Import de l'Index/Cache des Messages (MessageCache)
    const txCache = db.transaction(MESSAGE_CACHE_STORE, 'readwrite');
    const storeCache = txCache.objectStore(MESSAGE_CACHE_STORE);
    for (const item of backup.messageCache) {
      // Note : On reconvertit en Uint8Array car l'interface attend un Uint8Array pour le cache
      const rawPayload = base64ToBuffer(item.encryptedPayload);
      const rawIv = base64ToBuffer(item.iv);

      if (rawPayload && rawIv) {
        const restoredCache: EncryptedMessageCache = {
          id: item.id,
          encryptedPayload: new Uint8Array(rawPayload),
          iv: new Uint8Array(rawIv)
        };
        storeCache.put(restoredCache);
      }
    }

    // 4. Attente de la validation de toutes les transactions IndexedDB
    await new Promise<void>((resolve, reject) => {
      let count = 3; // 3 stores à synchroniser désormais
      const done = () => { if (--count === 0) resolve(); };
      
      txKeys.oncomplete = done;
      txCerts.oncomplete = done;
      txCache.oncomplete = done;
      
      txKeys.onerror = () => reject(txKeys.error);
      txCerts.onerror = () => reject(txCerts.error);
      txCache.onerror = () => reject(txCache.error);
    });

  } catch (error) {
    throw error;
  }
}