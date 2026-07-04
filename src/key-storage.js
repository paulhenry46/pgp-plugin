/**
 * IndexedDB persistence for the S/MIME plugin.
 *
 * The privileged plugin runs in a same-origin iframe, so all of its iframes
 * (the hidden background instance that runs hooks + each visible slot) share
 * one IndexedDB. That's what lets the settings slot unlock a key and the
 * background send/receive hooks immediately use it.
 *
 * Three stores:
 *  - key-records:   encrypted-at-rest private keys + certs (durable)
 *  - public-certs:  recipient/contact public certificates (durable)
 *  - session-keys:  unlocked, NON-EXTRACTABLE CryptoKeys (session-scoped;
 *                   wiped on activate() at app boot and on logout)
 *
 * CryptoKey objects are structured-cloneable, so IndexedDB can persist the
 * unlocked handles without ever exposing the raw key material — a
 * non-extractable key stays non-extractable when read back.
 */

const DB_NAME = 'smime-plugin-store';
const DB_VERSION = 1;
const KEY_RECORDS_STORE = 'key-records';
const PUBLIC_CERTS_STORE = 'public-certs';
const SESSION_KEYS_STORE = 'session-keys';

function openDB() {
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
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txPromise(db, storeName, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Key record CRUD ─────────────────────────────────────────────────

export async function saveKeyRecord(record) {
  const db = await openDB();
  await txPromise(db, KEY_RECORDS_STORE, 'readwrite', (s) => s.put(record));
}

export async function getKeyRecord(id) {
  const db = await openDB();
  return txPromise(db, KEY_RECORDS_STORE, 'readonly', (s) => s.get(id));
}

export async function listKeyRecords(accountId) {
  const db = await openDB();
  const all = await txPromise(db, KEY_RECORDS_STORE, 'readonly', (s) => s.getAll());
  if (!accountId) return all;
  return all.filter((r) => r.accountId === accountId || !r.accountId);
}

export async function deleteKeyRecord(id) {
  const db = await openDB();
  await txPromise(db, KEY_RECORDS_STORE, 'readwrite', (s) => s.delete(id));
}

// ── Public cert CRUD ────────────────────────────────────────────────

export async function savePublicCert(cert) {
  const db = await openDB();
  await txPromise(db, PUBLIC_CERTS_STORE, 'readwrite', (s) => s.put(cert));
}

export async function listPublicCerts(accountId) {
  const db = await openDB();
  const all = await txPromise(db, PUBLIC_CERTS_STORE, 'readonly', (s) => s.getAll());
  if (!accountId) return all;
  return all.filter((c) => c.accountId === accountId || !c.accountId);
}

export async function deletePublicCert(id) {
  const db = await openDB();
  await txPromise(db, PUBLIC_CERTS_STORE, 'readwrite', (s) => s.delete(id));
}

// ── Session (unlocked) key CRUD ─────────────────────────────────────
// Each entry: { id, signingKey, decryptionKey?, legacyDecryptionKey? }

export async function saveSessionKeys(entry) {
  const db = await openDB();
  await txPromise(db, SESSION_KEYS_STORE, 'readwrite', (s) => s.put(entry));
}

export async function getSessionKeys(id) {
  const db = await openDB();
  return txPromise(db, SESSION_KEYS_STORE, 'readonly', (s) => s.get(id));
}

export async function listSessionKeyIds() {
  const db = await openDB();
  const all = await txPromise(db, SESSION_KEYS_STORE, 'readonly', (s) => s.getAllKeys());
  return all;
}

export async function deleteSessionKeys(id) {
  const db = await openDB();
  await txPromise(db, SESSION_KEYS_STORE, 'readwrite', (s) => s.delete(id));
}

export async function clearSessionKeys() {
  const db = await openDB();
  await txPromise(db, SESSION_KEYS_STORE, 'readwrite', (s) => s.clear());
}
