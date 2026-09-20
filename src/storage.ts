/**
 * IndexedDB persistence for the OpenPGP plugin.
 *
 * Three stores:
 * - key-records:   encrypted-at-rest private keys + public keys (durable)
 * - public-certs:  recipient/contact public PGP keys (durable)
 * - local index:      decrypted mail previews + tokens (volatile, cleared on logout)
 */
import host from '@plugin-host';
import { base64ToBuffer, bufferToBase64, getCurrentAccountId } from "./util.ts";

const DB_NAME = 'pgp-plugin-store';
const DB_VERSION = 15;
const KEY_RECORDS_STORE = 'key-records';
const SESSION_KEYS_STORE = 'session-keys';
const MESSAGE_CACHE_STORE = 'message-cache';
const RECIPIENTS_STORE = 'recipients-cache'; 
const DANGEROUS_KEYS_STORE = 'dangerous-keys';
const DANGEROUS_MASTER_KEY_STORE = 'dangerous-master-key';
const MIGRATIONS_STORE = 'migrations';
const PLUGINS_STORAGE = 'plugins-storage';

// ── Interfaces ──────────────────────────────────────

export interface DbMigration {
  version: number;
  appliedAt: string;
  description?: string;
}
export interface KeyRecord {
  id: string;
  email: string;
  accountId?: string;
  publicKey: string;
  encryptedPrivateKey: ArrayBuffer; 
  salt: ArrayBuffer;                
  iv: ArrayBuffer;                  
  kdfIterations: number;//used for legacy PBKDF2 key derivation
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
  main?: boolean;
  recovery?: boolean;
  recoverable?: boolean;
  aesSalt?: ArrayBuffer;
  argon2Params?: {
    memoryCost: number; // ex: 65536 (64 MB)
    timeCost: number;   // ex: 3
    parallelism: number;// ex: 4
  };
  serverSide?: boolean;
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
  hmacKey?: CryptoKey;
}

export interface EncryptedMessageCache {
  id: string;
  keyRecordId: string; // ID of the KeyRecord used for encryption
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
      const transaction = request.transaction!;
      
      if (!db.objectStoreNames.contains(KEY_RECORDS_STORE)) {
        const keyStore = db.createObjectStore(KEY_RECORDS_STORE, { keyPath: 'id' });
        keyStore.createIndex('email', 'email', { unique: false });
        keyStore.createIndex('accountId', 'accountId', { unique: false });
      }
      if (!db.objectStoreNames.contains(SESSION_KEYS_STORE)) {
        db.createObjectStore(SESSION_KEYS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(RECIPIENTS_STORE)) {
        db.createObjectStore(RECIPIENTS_STORE, { keyPath: 'email' });
      }
      if (!db.objectStoreNames.contains(MESSAGE_CACHE_STORE)) {
        const store = db.createObjectStore(MESSAGE_CACHE_STORE, { keyPath: 'id' });
        store.createIndex('keyRecordId', 'keyRecordId', { unique: false });
      }
      let messageStore: IDBObjectStore;
      if (!db.objectStoreNames.contains(MESSAGE_CACHE_STORE)) {
        messageStore = db.createObjectStore(MESSAGE_CACHE_STORE, { keyPath: 'id' });
      } else {
        messageStore = transaction.objectStore(MESSAGE_CACHE_STORE);
      }
      if (!messageStore.indexNames.contains('keyRecordId')) {
        messageStore.createIndex('keyRecordId', 'keyRecordId', { unique: false });
      }
      if (!db.objectStoreNames.contains(DANGEROUS_KEYS_STORE)) {
        db.createObjectStore(DANGEROUS_KEYS_STORE);
      }
      if (!db.objectStoreNames.contains(DANGEROUS_MASTER_KEY_STORE)) {
        db.createObjectStore(DANGEROUS_MASTER_KEY_STORE);
      }
      if (!db.objectStoreNames.contains(MIGRATIONS_STORE)) {
        db.createObjectStore(MIGRATIONS_STORE, { keyPath: 'version' });
      }
      if (!db.objectStoreNames.contains(PLUGINS_STORAGE)) {
        db.createObjectStore(PLUGINS_STORAGE, { keyPath: 'id' });
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
// ── Plugins Store ───────────────────────────────────────
// This is used to store data of others plugin compatible with this plugin, such as calendar-encryption plugin.

export async function savePluginData(pluginId: string, data: any, accountId: string): Promise<void> {
  const db = await openDB();
  const entry = {
    id: pluginId+'___'+accountId,
    data,
    accountId
  };
  await txPromise<IDBValidKey>(db, PLUGINS_STORAGE, 'readwrite', (s) => s.put(entry));
}

export async function getPluginData(pluginId: string, accountId: string): Promise<any | undefined> {
  const db = await openDB();
  return txPromise<any | undefined>(db, PLUGINS_STORAGE, 'readonly', (s) => s.get(pluginId+'___'+accountId));
}

export async function deletePluginData(pluginId: string, accountId: string): Promise<void> {
  const db = await openDB();
  await txPromise<undefined>(db, PLUGINS_STORAGE, 'readwrite', (s) => s.delete(pluginId+'___'+accountId));
}

// ── Migrations Store ───────────────────────────────────────
export async function recordMigration(version: number, description?: string): Promise<void> {
  const db = await openDB();
  const entry: DbMigration = {
    version,
    appliedAt: new Date().toISOString(),
    description,
  };
  await txPromise<IDBValidKey>(db, MIGRATIONS_STORE, 'readwrite', (s) => s.put(entry));
}

export async function getCurrentDbVersion(): Promise<number> {
  const db = await openDB();
  const records = await txPromise<DbMigration[]>(db, MIGRATIONS_STORE, 'readonly', (s) => s.getAll());
  if (records.length === 0) return 0;
  return Math.max(...records.map((r) => r.version));
}

export async function getMigrationHistory(): Promise<DbMigration[]> {
  const db = await openDB();
  const records = await txPromise<DbMigration[]>(db, MIGRATIONS_STORE, 'readonly', (s) => s.getAll());
  return records.sort((a, b) => a.version - b.version);
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

export async function getDefaultKeyRecord(accountId?: string): Promise<KeyRecord |undefined>{
  
  const db = await openDB();
  let all = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
  const Id = accountId || await getCurrentAccountId();
  all = all.filter((k) => k.accountId === Id);

  return all.find((r) => r.default === true);
}

export async function getAllDefaultKeyRecords(): Promise<KeyRecord[]> {
  const db = await openDB();
  let all = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
  return all.filter((r) => r.default === true);
}

export async function deleteKeyRecord(id: string): Promise<void> {
  const db = await openDB();
  await txPromise<undefined>(db, KEY_RECORDS_STORE, 'readwrite', (s) => s.delete(id));
}

export async function deleteAllKeyRecords(accountId?: string): Promise<void> {
  const db = await openDB();
  let all = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
  if (accountId && accountId !== 'all') {
    all = all.filter((k) => k.accountId === accountId);
  }
  await Promise.all(all.map((k) => txPromise<undefined>(db, KEY_RECORDS_STORE, 'readwrite', (s) => s.delete(k.id))));
}

export async function setDefaultKeyRecord(targetId: string, isChecked: boolean): Promise<void> {
  const db = await openDB();
  let all = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
  // default property is now per account, so filter by current accountId
  const accountId = await getCurrentAccountId();
  all = all.filter((k) => k.accountId === accountId);

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

export async function getDefaultPublicKeyForEncryption(onlyId:boolean = false): Promise<string | undefined> {
  const db = await openDB();
  const accountId = await getCurrentAccountId();
  let allKeys = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
  allKeys = allKeys.filter((k) => k.accountId === accountId);
  const defaultPrivateKey = allKeys.find((k) => k.default === true);
  
  if (defaultPrivateKey) {
    if(onlyId) return defaultPrivateKey.id;
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

export async function clearAllMessageCache(accountId?: string): Promise<void> {
  const db = await openDB();

  if (accountId && accountId !== 'all') {
    const defaultKeyId = await getDefaultKeyRecord(accountId);
    if (defaultKeyId) {
      await txPromise(db, MESSAGE_CACHE_STORE, 'readwrite', (s) => {
        const index = s.index('keyRecordId');
        const request = index.openCursor(IDBKeyRange.only(defaultKeyId));

        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };

        return request;
      });
    }
  } else {
    await txPromise<undefined>(db, MESSAGE_CACHE_STORE, 'readwrite', (s) => s.clear());
  }
}
// ── Dangerous Session Key Storage ───────────────────────────────────────

async function getOrCreateMasterAesKey(db: IDBDatabase): Promise<CryptoKey> {
  const existingKey = await txPromise<CryptoKey | undefined>(
    db, 
    DANGEROUS_MASTER_KEY_STORE, 
    'readonly', 
    (s) => s.get('master-aes-key')
  );

  if (existingKey) {
    return existingKey;
  }

  // AES-GCM NON-extractable in IndexedDB
  const newKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false, // extractable = false
    ['encrypt', 'decrypt']
  );

  await txPromise<IDBValidKey>(
    db, 
    DANGEROUS_MASTER_KEY_STORE, 
    'readwrite', 
    (s) => s.put(newKey, 'master-aes-key')
  );

  return newKey;
}

export async function persistPassphraseToDangerousStorage(keyId: string, passphrase: string): Promise<void> {
  const db = await openDB();
  const aesKey = await getOrCreateMasterAesKey(db);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(passphrase);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, data);

  await txPromise<IDBValidKey>(
    db, 
    DANGEROUS_KEYS_STORE, 
    'readwrite', 
    (s) => s.put({ iv, encrypted }, keyId)
  );
}

export async function loadDangerousPassphrases(): Promise<Record<string, string>> {
  const db = await openDB();
  const aesKey = await getOrCreateMasterAesKey(db);

  const passphrasesMap: Record<string, string> = {};

  const allRecords = await txPromise<Array<{ iv: Uint8Array; encrypted: ArrayBuffer }>>(
    db, 
    DANGEROUS_KEYS_STORE, 
    'readonly', 
    (s) => s.getAll()
  );

  const allIds = await txPromise<string[]>(
    db, 
    DANGEROUS_KEYS_STORE, 
    'readonly', 
    (s) => s.getAllKeys()
  );

  for (let i = 0; i < allRecords.length; i++) {
    const { iv, encrypted } = allRecords[i];
    const keyId = allIds[i];

    try {
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, aesKey, encrypted);
      passphrasesMap[keyId] = new TextDecoder().decode(decrypted);
    } catch (e) {
      console.error(`Failed to decrypt passphrase for key ${keyId}`, e);
    }
  }

  return passphrasesMap;
}

export async function clearDangerousStorage(accountId?: string): Promise<void> {
  if (accountId && accountId !== 'all') {
    const keys = await listKeyRecords(accountId);
    // get the ids of the keys for this account
    const keyIds = keys.map(k => k.id);
    const db = await openDB();
    await Promise.all(keyIds.map(id => 
      txPromise<undefined>(db, DANGEROUS_KEYS_STORE, 'readwrite', (s) => s.delete(id))
    ));
    return;
  }

  const db = await openDB();
  await txPromise<undefined>(
    db, 
    DANGEROUS_KEYS_STORE, 
    'readwrite', 
    (s) => s.clear()
  );
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

export async function exportPluginData(accountId?: string): Promise<void> {
  try {
    const db = await openDB();
    let rawKeys: KeyRecord[];
    let rawCerts: PublicCert[];
    let rawCache: EncryptedMessageCache[];
    let rawMigrations: DbMigration[] = [];

    if (accountId) {
      rawKeys = (await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll())).filter((k) => k.accountId === accountId);
      rawCache = (await txPromise<EncryptedMessageCache[]>(db, MESSAGE_CACHE_STORE, 'readonly', (s) => s.getAll())).filter((m) => {
        return rawKeys.some((k) => k.id === m.keyRecordId);
      });
    } else {
      rawKeys = await txPromise<KeyRecord[]>(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
      rawCache = await txPromise<EncryptedMessageCache[]>(db, MESSAGE_CACHE_STORE, 'readonly', (s) => s.getAll());
    }

    if (db.objectStoreNames.contains(MIGRATIONS_STORE)) {
      rawMigrations = await txPromise<DbMigration[]>(db, MIGRATIONS_STORE, 'readonly', (s) => s.getAll());
    }

    const serializedKeys = rawKeys.map(key => ({
      ...key,
      encryptedPrivateKey: bufferToBase64(key.encryptedPrivateKey),
      salt: bufferToBase64(key.salt),
      iv: bufferToBase64(key.iv),
      aesSalt: key.aesSalt ? bufferToBase64(key.aesSalt) : undefined,
      webauthn: key.webauthn ? {
        credentialId: bufferToBase64(key.webauthn.credentialId),
        encryptedPassphrase: bufferToBase64(key.webauthn.encryptedPassphrase),
        iv: bufferToBase64(key.webauthn.iv),
      } : undefined
    }));

    const serializedCache = rawCache.map(item => ({
      id: item.id,
      keyRecordId: item.keyRecordId,
      encryptedPayload: bufferToBase64(item.encryptedPayload),
      iv: bufferToBase64(item.iv)
    }));

    const backupPackage = {
      format: "openpgp-plugin-backup",
      version: DB_VERSION,
      createdAt: new Date().toISOString(),
      keys: serializedKeys,
      messageCache: serializedCache,
      migrations: rawMigrations
    };

    const jsonString = JSON.stringify(backupPackage, null, 2);
    await host.ui.downloadFile({
      content: jsonString,
      filename: accountId ? `pgp_plugin_backup_${accountId}_${new Date().toISOString().split('T')[0]}.json` : `pgp_plugin_backup_${new Date().toISOString().split('T')[0]}.json`,
      contentType: 'application/json'
    });

  } catch (error) {
    throw new Error(`Unable to export plugin data: ${(error as Error).message}`);
  }
}

export async function importPluginData(jsonContent: string, accountId?: string): Promise<void> {
  try {
    const backup = JSON.parse(jsonContent);
    if (backup.format !== "openpgp-plugin-backup" || !backup.keys || !backup.certs || !backup.messageCache) {
      throw new Error("Invalid backup file. Missing keys, certs or message cache.");
    }

    const db = await openDB();

    const keysToImport = accountId 
      ? backup.keys.filter((key: any) => key.accountId === accountId)
      : backup.keys;

    const allowedKeyIds = new Set<string>(keysToImport.map((k: any) => k.id));

    const txKeys = db.transaction(KEY_RECORDS_STORE, 'readwrite');
    const storeKeys = txKeys.objectStore(KEY_RECORDS_STORE);
    for (const key of keysToImport) {
      const restoredKey: KeyRecord = {
        ...key,
        encryptedPrivateKey: base64ToBuffer(key.encryptedPrivateKey) as ArrayBuffer,
        salt: base64ToBuffer(key.salt) as ArrayBuffer,
        iv: base64ToBuffer(key.iv) as ArrayBuffer,
        aesSalt: key.aesSalt ? (base64ToBuffer(key.aesSalt) as ArrayBuffer) : undefined,
        webauthn: key.webauthn ? {
          credentialId: base64ToBuffer(key.webauthn.credentialId) as ArrayBuffer,
          encryptedPassphrase: base64ToBuffer(key.webauthn.encryptedPassphrase) as ArrayBuffer,
          iv: base64ToBuffer(key.webauthn.iv) as ArrayBuffer,
        } : undefined
      };
      storeKeys.put(restoredKey);
    }


    const cacheToImport = accountId
      ? backup.messageCache.filter((item: any) => allowedKeyIds.has(item.keyRecordId))
      : backup.messageCache;

    const txCache = db.transaction(MESSAGE_CACHE_STORE, 'readwrite');
    const storeCache = txCache.objectStore(MESSAGE_CACHE_STORE);
    for (const item of cacheToImport) {
      const rawPayload = base64ToBuffer(item.encryptedPayload);
      const rawIv = base64ToBuffer(item.iv);

      if (rawPayload && rawIv) {
        const restoredCache: EncryptedMessageCache = {
          id: item.id,
          keyRecordId: item.keyRecordId,
          encryptedPayload: new Uint8Array(rawPayload),
          iv: new Uint8Array(rawIv)
        };
        storeCache.put(restoredCache);
      }
    }

    const transactionsToWait: IDBTransaction[] = [txKeys, txCache];

    if (Array.isArray(backup.migrations) && db.objectStoreNames.contains(MIGRATIONS_STORE)) {
      const txMigrations = db.transaction(MIGRATIONS_STORE, 'readwrite');
      const storeMigrations = txMigrations.objectStore(MIGRATIONS_STORE);
      for (const migration of backup.migrations) {
        storeMigrations.put(migration);
      }
      transactionsToWait.push(txMigrations);
    }

    await Promise.all(
      transactionsToWait.map(
        (tx) =>
          new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          })
      )
    );

  } catch (error) {
    throw error;
  }
}