/**
 * OpenPGP private key import + private-key encryption-at-rest / unlock.
 * Architecture en Boîte Noire (RAM Isolation).
 */

import * as openpgp from 'openpgp';
import { generateUUID } from '../util.ts';
import { extractKeyInfo } from './key-utils.ts';
import { KeyRecord, listPublicCerts, savePublicCert } from '../storage.ts';
import { KDF_ITERATIONS, AES_KEY_LENGTH } from '../shared.ts';
import { broadcastUnlockKey } from './session-broadcast.ts';

// ── Definitions & Interfaces ──────────────────────────────────────────

interface EncryptedData {
  encrypted: ArrayBuffer;
  salt: ArrayBuffer;
  iv: ArrayBuffer;
}

// ── Main Core Functions ───────────────────────────────────────────────

/**
 * Importe une clé privée OpenPGP blindée (ASCII), extrait ses métadonnées et la chiffre pour le stockage au repos.
 */
export async function importOpenPgpPrivateKey(
  armoredPrivateKeyText: string,
  storagePassphrase: string,
  currentPassphrase: string,
): Promise<{ keyRecord: KeyRecord; keyInfo: any }> {
  if (!armoredPrivateKeyText || typeof armoredPrivateKeyText !== 'string') {
    throw new Error('Invalid OpenPGP private key: text block required');
  }

  // 1. Analyse et validation de la clé
  let privateKey: openpgp.Key;
  try {
    privateKey = await openpgp.readKey({ armoredKey: armoredPrivateKeyText });
    if (!privateKey.isPrivate()) {
      throw new Error('The provided block is a public key, not a private key');
    }

    if (!privateKey.isDecrypted()) {
      const decryptedKey = await openpgp.decryptKey({
        privateKey,
        passphrase: currentPassphrase
      });
      if (!decryptedKey) {
        throw new Error('Invalid passphrase for this OpenPGP private key');
      }
    }
  } catch (err: any) {
    throw new Error(`OpenPGP key validation failed: ${err.message}`);
  }

  // 2. Extraction des métadonnées
  const keyInfo = (await extractKeyInfo(privateKey)) as any;
  const email = (keyInfo.emailAddresses?.[0] ?? '').toLowerCase();
  if (!email) {
    throw new Error('OpenPGP private key must be bound to at least one valid email User ID');
  }

  // 3. Chiffrement AES-GCM local de la clé brute pour stockage IndexedDB
  const textBytes = new TextEncoder().encode(armoredPrivateKeyText);
  const { encrypted, salt, iv } = await encryptPrivateKeyData(textBytes.buffer, storagePassphrase);

  // 4. Génération de l'enregistrement KeyRecord
  const keyRecord: KeyRecord = {
    id: generateUUID(),
    email,
    publicKey: keyInfo.armoredPublicKey || '',
    encryptedPrivateKey: encrypted,
    salt,
    iv,
    kdfIterations: KDF_ITERATIONS,
    issuer: keyInfo.issuer || 'Self-Signed (OpenPGP Web of Trust)',
    subject: keyInfo.subject || `OpenPGP User <${email}>`,
    serialNumber: keyInfo.serialNumber || keyInfo.fingerprint.substring(0, 16).toUpperCase(),
    notBefore: keyInfo.notBefore,
    notAfter: keyInfo.notAfter || null,
    fingerprint: keyInfo.fingerprint,
    algorithm: keyInfo.algorithm || 'RSA/ECC',
    capabilities: {
      canSign: keyInfo.capabilities?.canSign !== false,
      canEncrypt: keyInfo.capabilities?.canEncrypt !== false
    }
  };

  if (keyInfo.armoredPublicKey) {
    const existingCerts = await listPublicCerts();
    const alreadyExists = existingCerts.some((c) => c.fingerprint === keyInfo.fingerprint);
    
    if (!alreadyExists) {
      await savePublicCert({
        id: generateUUID(),
        email,
        publicKey: keyInfo.armoredPublicKey,
        issuer: keyRecord.issuer,
        subject: keyRecord.subject,
        notBefore: keyRecord.notBefore,
        notAfter: keyRecord.notAfter,
        fingerprint: keyRecord.fingerprint,
        source: 'private-key',
      });
    }
  }

  return { keyRecord, keyInfo };
}

/**
 * Déverrouille la clé privée en déléguant l'opération au Background script (Boîte Noire).
 * Aucune donnée sensible ou clé AES brute ne transite vers le thread de l'Iframe/UI.
 */
/**
 * Déverrouille la clé privée en déléguant l'opération au Background script (Boîte Noire).
 */
export async function unlockPrivateKey(record: KeyRecord, passphrase: string): Promise<boolean> {
  try {
    // On notifie le Background de charger et déverrouiller la clé en RAM isolée
    await broadcastUnlockKey({
      id: record.id,
      encryptedPrivateKey: record.encryptedPrivateKey,
      salt: record.salt,
      iv: record.iv,
      kdfIterations: record.kdfIterations,
      passphrase
    });

    // Si la fonction broadcastUnlockKey ne lève pas d'erreur, on considère l'action initiée.
    return true;
  } catch (err) {
    console.error('[Import] Échec lors de la transmission du déverrouillage :', err);
    throw new Error('Incorrect passphrase or background communication failed');
  }
}

export async function importOpenPgpPublicKey(armoredPublicKeyText: string): Promise<string> {
  const readKey = await openpgp.readKey({ armoredKey: armoredPublicKeyText });
  const info = await extractKeyInfo(readKey);
  
  const email = (info.emailAddresses[0] || '').toLowerCase();
  if (!email) throw new Error('Key has no valid email address associated');
  
  const existing = (await listPublicCerts()).some((c) => c.fingerprint === info.fingerprint);
  if (!existing) {
    await savePublicCert({
      id: generateUUID(),
      email,
      publicKey: armoredPublicKeyText,
      issuer: info.issuer,
      subject: info.subject,
      notBefore: info.notBefore,
      notAfter: info.notAfter,
      fingerprint: info.fingerprint,
      source: 'manual',
    });
  }
  return email;
}

// ── Private key encryption / decryption ──────────────────────────────

async function deriveWrappingKey(passphrase: string, salt: ArrayBuffer, iterations: number): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptPrivateKeyData(pkcs8Bytes: ArrayBuffer, passphrase: string): Promise<EncryptedData> {
  const salt = crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer;
  const iv = crypto.getRandomValues(new Uint8Array(12)).buffer as ArrayBuffer;
  const wrappingKey = await deriveWrappingKey(passphrase, salt, KDF_ITERATIONS);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrappingKey, pkcs8Bytes);
  return { encrypted, salt, iv };
}