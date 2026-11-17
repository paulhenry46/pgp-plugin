import * as openpgp from 'openpgp';
import { argon2id } from 'hash-wasm';
import { ContactEmail, generateUUID, getCurrentAccountId } from '../util.ts';
import { extractKeyInfo } from './key-utils.ts';
import { keyAddressFor } from './key-address.ts';
import { KeyRecord, persistPassphraseToDangerousStorage } from '../storage.ts';
import { KDF_ITERATIONS, AES_KEY_LENGTH, settings, config } from '../shared.ts';
import { deriveAesKeyFromPgpParams, getIndex } from '../cache.ts';
import { type ContactCard } from '../util.ts';
import { contacts } from '@plugin-host';


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
  aesKey?: CryptoKey;
  hmacKey?: CryptoKey;
}

const ARGON2_DEFAULTS = {
  memoryCost: 65536, // 64 Mo RAM
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 threads
  hashLength: 32     // 256 bits
};

// ── Main Core Functions ───────────────────────────────────────────────

/**
 * Imports an Armored OpenPGP private key (ASCII), extracts its metadata and encrypts it at rest.
 */
export async function importOpenPgpPrivateKey(
  armoredPrivateKeyText: string,
  storagePassphrase: string,
  currentPassphrase: string,
): Promise<{ keyRecord: KeyRecord; keyInfo: any }> {
  if (!armoredPrivateKeyText || typeof armoredPrivateKeyText !== 'string') {
    throw new Error('Invalid OpenPGP private key: text block required');
  }

  // 1. Parse & Decrypt
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

  // 2. Extract metadata
  const keyInfo = (await extractKeyInfo(privateKey)) as any;
  const email = (keyInfo.emailAddresses?.[0] ?? '').toLowerCase();
  if (!email) {
    throw new Error('OpenPGP private key must be bound to at least one valid email User ID');
  }

  // 3. Encrypt private key for at-rest storage
  const textBytes = new TextEncoder().encode(armoredPrivateKeyText);
  const { encrypted, salt, iv, argon2Params } = await encryptPrivateKeyData(textBytes.buffer, storagePassphrase);

  // 4. Generate KeyRecord
  //get current account ID
  const accountId = await getCurrentAccountId();
  const keyRecord: KeyRecord = {
    id: generateUUID(),
    accountId,
    email,
    emails: [...new Set<string>(keyInfo.emailAddresses.map((e: string) => e.toLowerCase()))],
    publicKey: keyInfo.armoredPublicKey || '',
    encryptedPrivateKey: encrypted,
    salt,
    iv,
    argon2Params,
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
    // import in contacts too to check our signature in 'sent' folder // TODO check if exists before
    await importOpenPgpPublicKey(keyInfo.armoredPublicKey);
  }

  return { keyRecord, keyInfo };
}

/**
 * Decrypts the private key stored at rest and returns unlocked openpgp.PrivateKey instances.
 * @param record - The keyRecord extracted from IndexedDB
 * @param passphrase - The storage password defined by the user
 * @param automated - Whether the unlock is automated
 */
export async function unlockPrivateKey(record: KeyRecord, passphrase: string, automated?: boolean): Promise<UnlockResult> {
  // 1. Dérivation de la clé de déballage pour la clé PGP
  console.log('Unlocking private key for record ID:', record.id);
  let masterKey: CryptoKey | undefined;
  let PGPWrappingKey: CryptoKey | undefined;
  let aesKey: CryptoKey | undefined;
  let hmacKey: CryptoKey | undefined;

  if(record.argon2Params !== undefined) {
    masterKey = await deriveMasterHkdfKey(passphrase, record.salt, {
        ...ARGON2_DEFAULTS,
        ...record.argon2Params
      });

    PGPWrappingKey = await deriveSubKey(masterKey, 'pgp-wrapping-key');
  }else{//legacy path for existing keys without argon2Params
    PGPWrappingKey = await deriveWrappingKey(passphrase, record.salt, record.kdfIterations);
  }

  let rawTextBytes: ArrayBuffer;
  try {
    rawTextBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: record.iv },
      PGPWrappingKey,
      record.encryptedPrivateKey
    );
  } catch {
    throw new Error('Incorrect passphrase');
  }

  const armoredPrivateKeyText = new TextDecoder().decode(rawTextBytes);
  const parsedKey = await openpgp.readKey({ armoredKey: armoredPrivateKeyText });
  let openPgpPrivateKey = parsedKey as openpgp.PrivateKey;

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
  // Handle persistent storage if conditions are met (shared by both branches)
  if (settings().StoreDangerous && (await config('allowPersistentKeys')) === true && automated !== true) {
    await persistPassphraseToDangerousStorage(record.id, passphrase).catch(console.error);
  }

  if (record.default === true && (masterKey !== undefined || record.aesSalt !== undefined)) {
    if(masterKey){
      aesKey = await deriveSubKey(masterKey, 'aes-key');
      hmacKey = await deriveSubKey(masterKey, 'secret-generator', true);
    }else if(record.aesSalt !== undefined){// legacy path for existing keys without argon2Params
      aesKey = await deriveAesKeyFromPgpParams(passphrase, record.aesSalt, record.kdfIterations);
    }else{
      throw new Error('Cannot derive AES key: missing parameters');
    }
    await getIndex(aesKey, record);
  }

  return {
    unlockedPrivateKey: openPgpPrivateKey.armor(),
    signingKey: openPgpPrivateKey.armor(),
    decryptionKey: openPgpPrivateKey.armor(),
    ...(aesKey && { aesKey }),
    ...(hmacKey && { hmacKey })
  };
}

/**
 * Saves a public key to the contact of an address.
 * @param forEmail - The address the key was obtained for (the sender of the
 *   message it came with, the address looked up). The key is then saved under
 *   that address, and refused unless one of its User IDs carries it. Without
 *   it (a key the user picked by hand), the key's first User ID is used.
 */
export async function importOpenPgpPublicKey(armoredPublicKeyText: string, forEmail?: string): Promise<string[]> {
  const readKey = await openpgp.readKey({ armoredKey: armoredPublicKeyText });
  const info = await extractKeyInfo(readKey);

  let targetEmails: string[];
  if (forEmail === undefined) {
    targetEmails = info.emailAddresses.map(str => str.toLowerCase());
    if (targetEmails.length === 0) throw new Error('Key has no valid email address associated');
  } else {
    const bound = keyAddressFor(info.emailAddresses, forEmail);
    if (!bound) throw new Error(`Key has no User ID for ${forEmail}`);
    targetEmails = [bound.toLowerCase()];
  }

  // A file can hold more than one key, and only the first is read. A key
  // obtained for an address is saved as that one key, the one that was
  // checked and shown to the user, not as the whole file.
  const armoredToSave = forEmail === undefined ? armoredPublicKeyText : readKey.armor();
  const bytes = new TextEncoder().encode(armoredToSave);

  const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  const base64Key = btoa(binaryString);
  const keyUri = `data:application/pgp-keys;base64,${base64Key}`;

  let existingContact: ContactCard | undefined;
  for (const email of targetEmails) {
    const searchResults = await contacts.search(email);
    
    existingContact = searchResults.find(c => 
      c.emails && Object.values(c.emails as Record<string, ContactEmail>).some(e => e.address.toLowerCase() === email)
    );

    if (existingContact) break;
  }

  const keyId = `pgp_${info.fingerprint || Date.now()}`;
  if (existingContact && existingContact.id) {
    const updatedCryptoKeys = {
      ...existingContact.cryptoKeys,
      [keyId]: {
        uri: keyUri,
        mediaType: 'application/pgp-keys',
      }
    };

    // All address exist in the existing contact
    const existingAddresses = new Set(
      Object.values(existingContact.emails || {}).map((e: any) => e.address.toLowerCase())
    );

    const updatedEmails = { ...(existingContact.emails || {}) };
    let addedCount = 0;
    
    for (const email of targetEmails) {
      if (!existingAddresses.has(email)) {
        const uniqueKey = `email_${Date.now()}_${addedCount++}`;
        updatedEmails[uniqueKey] = {
          address: email,
          pref: Object.keys(updatedEmails).length === 0 ? 1 : undefined,
        };
      }
    }

    await contacts.update(existingContact.id, {
      cryptoKeys: updatedCryptoKeys,
      emails: updatedEmails,
    });

  } else {
    // Create a new contact with all key address
    const emailsMap: Record<string, ContactEmail> = {};
    targetEmails.forEach((email, index) => {
      const keyName = index === 0 ? 'primary' : `email_${index}`;
      emailsMap[keyName] = {
        address: email,
        pref: index === 0 ? 1 : undefined,
      };
    });

    const newContact: ContactCard = {
      addressBookIds: {},
      name: {
        full: info.subject || targetEmails[0],
      },
      emails: emailsMap,
      cryptoKeys: {
        [keyId]: {
          uri: keyUri,
          mediaType: 'application/pgp-keys',
        }
      }
    };

    await contacts.create(newContact);
  }

  return targetEmails;
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

async function deriveMasterHkdfKey(
  passphrase: string,
  salt: ArrayBuffer,
  params = ARGON2_DEFAULTS
): Promise<CryptoKey> {
  const rawKeyBytes = await argon2id({
    password: passphrase,
    salt: new Uint8Array(salt),
    parallelism: params.parallelism,
    iterations: params.timeCost,
    memorySize: params.memoryCost,
    hashLength: params.hashLength,
    outputType: 'binary'
  });


  // Importe en tant que clé maître HKDF (permet la dérivation de sous-clés)
  return crypto.subtle.importKey(
    'raw',
    rawKeyBytes as BufferSource,
    { name: 'HKDF' },
    false,
    ['deriveKey', 'deriveBits']
  );
}

async function deriveSubKey(
  masterHkdfKey: CryptoKey,
  infoString: string,
  hmac: boolean = false
): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  const keyAlgorithm: AesKeyGenParams | HmacImportParams = hmac
    ? { name: 'HMAC', hash: 'SHA-256', length: 256 }
    : { name: 'AES-GCM', length: 256 };

  const keyUsages: KeyUsage[] = hmac 
    ? ['sign'] 
    : ['encrypt', 'decrypt'];

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0), 
      info: encoder.encode(infoString)
    },
    masterHkdfKey,
    keyAlgorithm,
    false,
    keyUsages
  );
}

async function encryptPrivateKeyData(
  pkcs8Bytes: ArrayBuffer,
  passphrase: string
): Promise<EncryptedData & { argon2Params: typeof ARGON2_DEFAULTS }> {
  // Génération d'un sel unique de 16 octets
  const salt = crypto.getRandomValues(new Uint8Array(16)).buffer as ArrayBuffer;
  const iv = crypto.getRandomValues(new Uint8Array(12)).buffer as ArrayBuffer;

  const masterKey = await deriveMasterHkdfKey(passphrase, salt, ARGON2_DEFAULTS);
  const wrappingKey = await deriveSubKey(masterKey, 'pgp-wrapping-key');
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrappingKey, pkcs8Bytes);

  return { encrypted, salt, iv, argon2Params: ARGON2_DEFAULTS };
}