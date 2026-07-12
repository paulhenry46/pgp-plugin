/**
 * IndexedDB persistence for the OpenPGP plugin.
 *
 * Four stores:
 * - key-records:   encrypted-at-rest private keys + public keys (durable)
 * - public-certs:  recipient/contact public PGP keys (durable)
 * - session-keys:  unlocked OpenPGP private key objects (session-scoped)
 * - attachments:   email file attachments (durable) // only used when Atarchment + Draft are encrypted
 */

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
  aesKey: CryptoKey;
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