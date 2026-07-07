/**
 * OpenPGP private key import + private-key encryption-at-rest / unlock.
 * Replaces the legacy S/MIME PKCS#12 pipeline.
 *
 * Armored private keys are wrapped with AES-GCM under a PBKDF2(600k, SHA-256) key
 * derived from a user browser-passphrase. Unlocked keys are loaded natively as OpenPGP instances.
 */

import * as openpgp from 'openpgp';
import { generateUUID } from '../util.ts';
import { extractKeyInfo } from './key-utils.ts';
import { KeyRecord, listPublicCerts, savePublicCert } from '../key-storage.ts';

const KDF_ITERATIONS = 600_000;
const AES_KEY_LENGTH = 256;

// ── Definitions & Interfaces ──────────────────────────────────────────

interface EncryptedData {
  encrypted: ArrayBuffer;
  salt: ArrayBuffer;
  iv: ArrayBuffer;
}

interface UnlockResult {
  unlockedPrivateKey: string;
  signingKey: string;
  decryptionKey: string;
}

// ── Main Core Functions ───────────────────────────────────────────────

/**
 * Imports an Armored OpenPGP private key (ASCII), extracts its metadata and encrypts it at rest.
 * @param armoredPrivateKeyText - The text block "-----BEGIN PGP PRIVATE KEY BLOCK-----"
 * @param storagePassphrase - The password chosen to encrypt the key in the browser's IndexedDB storage
 */
export async function importOpenPgpPrivateKey(
  armoredPrivateKeyText: string,
  storagePassphrase: string,
  currentPassphrase: string,
): Promise<{ keyRecord: KeyRecord; keyInfo: any }> {
  if (!armoredPrivateKeyText || typeof armoredPrivateKeyText !== 'string') {
    throw new Error('Invalid OpenPGP private key: text block required');
  }

  // 1. Parse the key with OpenPGP and attempt to decrypt it with the currentPassphrase
  let privateKey: openpgp.Key;
  try {
    privateKey = await openpgp.readKey({ armoredKey: armoredPrivateKeyText });
    if (!privateKey.isPrivate()) {
      throw new Error('The provided block is a public key, not a private key');
    }

    // If the key is encrypted (protected), we attempt to decrypt it with the provided passphrase
    if (!privateKey.isDecrypted()) {
      const decryptedKey = await openpgp.decryptKey({
        privateKey,
        passphrase: currentPassphrase
      });
      
      // We ensure that decryption succeeded (OpenPGPjs returns the decrypted key)
      if (!decryptedKey) {
        throw new Error('Invalid passphrase for this OpenPGP private key');
      }
    }
  } catch (err: any) {
    throw new Error(`OpenPGP key validation failed: ${err.message}`);
  }

  // 2. Extract key metadata to populate the data model expected by the UI
  const keyInfo = (await extractKeyInfo(privateKey)) as any;
  console.log('keyinfo:', keyInfo);
  const email = (keyInfo.emailAddresses?.[0] ?? '').toLowerCase();
  console.log(email);
  if (!email) {
    throw new Error('OpenPGP private key must be bound to at least one valid email User ID');
  }

  // 3. Encrypt the plain text block of the private key for local storage (at-rest)
  const textBytes = new TextEncoder().encode(armoredPrivateKeyText);
  const { encrypted, salt, iv } = await encryptPrivateKeyData(textBytes.buffer, storagePassphrase);

  // 4. Generate the final record perfectly aligned with the KeyRecord interface
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

  return { keyRecord, keyInfo };
}

/**
 * Decrypts the private key stored at rest and returns unlocked openpgp.PrivateKey instances.
 * @param record - The keyRecord extracted from IndexedDB
 * @param passphrase - The storage password defined by the user
 */
export async function unlockPrivateKey(record: KeyRecord, passphrase: string): Promise<UnlockResult> {
  const wrappingKey = await deriveWrappingKey(passphrase, record.salt, record.kdfIterations);

  let rawTextBytes: ArrayBuffer;
  try {
    rawTextBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: record.iv },
      wrappingKey,
      record.encryptedPrivateKey
    );
  } catch {
    throw new Error('Incorrect passphrase');
  }

  const armoredPrivateKeyText = new TextDecoder().decode(rawTextBytes);
  
  // Read and load the OpenPGP private key object
  const parsedKey = await openpgp.readKey({ armoredKey: armoredPrivateKeyText });
  let openPgpPrivateKey = parsedKey as openpgp.PrivateKey;

  // If the internal PGP private key itself has a passphrase, we unlock it
  if (!openPgpPrivateKey.isDecrypted()) {
    try {
      openPgpPrivateKey = await openpgp.decryptKey({
        privateKey: openPgpPrivateKey,
        passphrase
      });
    } catch (err: any) {
      throw new Error(`Failed to decrypt internal OpenPGP packets: ${err.message}`);
    }
  }

  return {
    unlockedPrivateKey: openPgpPrivateKey.armor(),
    signingKey: openPgpPrivateKey.armor(),
    decryptionKey: openPgpPrivateKey.armor()
  };
}

export async function importOpenPgpPublicKey(armoredPublicKeyText: string): Promise<any> {

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

