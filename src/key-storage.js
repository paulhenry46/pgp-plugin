/**
 * IndexedDB persistence for the OpenPGP plugin.
 *
 * Three stores:
 * - key-records:   encrypted-at-rest private keys + public keys (durable)
 * - public-certs:  recipient/contact public PGP keys (durable)
 * - session-keys:  unlocked OpenPGP private key objects (session-scoped)
 */

const DB_NAME = 'pgp-plugin-store';
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

// ── Private Key Records CRUD ────────────────────────────────────────

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

// ── Public Keys (Contacts) CRUD ─────────────────────────────────────

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

// ── Session (unlocked OpenPGP Key Objects) CRUD ─────────────────────

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