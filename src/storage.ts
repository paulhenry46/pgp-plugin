/**
 * IndexedDB persistence for the OpenPGP plugin.
 *
 * Three stores:
 * - key-records:   encrypted-at-rest private keys + public keys (durable)
 * - public-certs:  recipient/contact public PGP keys (durable)
 * - local index:      decrypted mail previews + tokens (volatile, cleared on logout)
 */
import host from '@plugin-host';
import { base64ToBuffer, bufferToBase64 } from "./util.ts";

const DB_NAME = 'pgp-plugin-store';
const DB_VERSION = 7;
const KEY_RECORDS_STORE = 'key-records';
const PUBLIC_CERTS_STORE = 'public-certs';
const SESSION_KEYS_STORE = 'session-keys';
const MESSAGE_CACHE_STORE = 'message-cache';
const RECIPIENTS_STORE = 'recipients-cache'; 

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
    credentialId: ArrayBuffer;     
    encryptedPassphrase: ArrayBuffer; 
    iv: ArrayBuffer;               
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
  aesSalt?: ArrayBuffer;
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
  id: string;
  encryptedPayload: Uint8Array; // = { preview, tokens } AES encrypted
  iv: Uint8Array;
}

export interface DecryptedCachePayload {
  preview: string;
  tokens: string[];
}

export interface Recipient {
  email: string;
  hasNotPublicKey: boolean;
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
       if (!db.objectStoreNames.contains(RECIPIENTS_STORE)) {
        db.createObjectStore(RECIPIENTS_STORE, { keyPath: 'email' });
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

// ── CRUD Cache ───────────────────────────────

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
  
  await Promise.all(
    ids.map(id => {
      return new Promise<void>((resolve) => {
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result) results[id] = req.result;
          resolve();
        };
        req.onerror = () => resolve();
      });
    })
  );
  
  return results;
}

export async function clearAllMessageCache(): Promise<void> {
  const db = await openDB();
  await txPromise<undefined>(db, MESSAGE_CACHE_STORE, 'readwrite', (s) => s.clear());
}

//------------------ Recipient Store -----------------------------

export async function saveRecipient(recipient: Recipient): Promise<void> {
  const db = await openDB();
  await txPromise<IDBValidKey>(db, RECIPIENTS_STORE, 'readwrite', (s) => s.put(recipient));
}

export async function getRecipient(email: string): Promise<Recipient | undefined> {
  const db = await openDB();
  return txPromise<Recipient | undefined>(db, RECIPIENTS_STORE, 'readonly', (s) => s.get(email));
}

//------------------ Export / Import Plugin Data -----------------------------

export async function exportPluginData(): Promise<void> {
  try {
    const db = await openDB();
    
    const rawKeys = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
    const rawCerts = await txPromise<PublicCert[]>(db, PUBLIC_CERTS_STORE, 'readonly', (s) => s.getAll());
    const rawCache = await txPromise<EncryptedMessageCache[]>(db, MESSAGE_CACHE_STORE, 'readonly', (s) => s.getAll());

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

    const serializedCache = rawCache.map(item => ({
      id: item.id,
      encryptedPayload: bufferToBase64(item.encryptedPayload),
      iv: bufferToBase64(item.iv)
    }));

    const backupPackage = {
      format: "openpgp-plugin-backup",
      version: DB_VERSION,
      createdAt: new Date().toISOString(),
      keys: serializedKeys,
      certs: rawCerts,
      messageCache: serializedCache
    };

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
    if (backup.format !== "openpgp-plugin-backup" || !backup.keys || !backup.certs || !backup.messageCache) {
      throw new Error("Fichier de sauvegarde invalide ou corrompu.");
    }

    const db = await openDB();
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

    const txCerts = db.transaction(PUBLIC_CERTS_STORE, 'readwrite');
    const storeCerts = txCerts.objectStore(PUBLIC_CERTS_STORE);
    for (const cert of backup.certs) {
      storeCerts.put(cert);
    }

    const txCache = db.transaction(MESSAGE_CACHE_STORE, 'readwrite');
    const storeCache = txCache.objectStore(MESSAGE_CACHE_STORE);
    for (const item of backup.messageCache) {

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

    await new Promise<void>((resolve, reject) => {
      let count = 3;
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