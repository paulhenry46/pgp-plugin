/**
 * Decrypt OpenPGP encrypted messages using local keys.
 * Replaces the legacy S/MIME CMS EnvelopedData decoder.
 */

import * as openpgp from 'openpgp';
import {KeyRecord} from '../storage.ts'; // Import the KeyRecord interface generated in the previous step
import { clearArmoredPrivateKeyToPrivateKey } from '../util.ts';

export class PgpKeyLockedError extends Error {
  public keyRecordId: string;
  constructor(message: string, keyRecordId: string) {
    super(message);
    this.name = 'PgpKeyLockedError';
    this.keyRecordId = keyRecordId;
  }
}

/**
 * Attempts to decrypt an OpenPGP message.
 * @param {Object} input
 * @param {Uint8Array} input.cmsBytes - The bytes of the encrypted OpenPGP message.
 * @param {Array} input.keyRecords - Metadata of the user's private keys from IndexedDB.
 * @param {Map} input.unlockedKeys - Map (keyRecordId -> unlocked openpgp.PrivateKey) for this session.
 * @returns {Promise<{ mimeBytes: Uint8Array, keyRecordId: string }>}
 */
export async function pgpDecrypt(input: { 
  cmsBytes: Uint8Array, 
  keyRecords: KeyRecord[], 
  unlockedKeys: Map<string, string>,
  knownPublicKeys?: openpgp.PublicKey[] //  public keys for verification (signing)
}) {
  const { cmsBytes, keyRecords, unlockedKeys, knownPublicKeys = [] } = input;

  // 1. Normalization of the input payload
  console.log('[plugin:smime] : CmsBytes :', cmsBytes);
  const armoredMessage = normalizePgpMessage(cmsBytes);
  console.log('[plugin:smime] : armored :', armoredMessage);
  let parsedMessage: openpgp.Message<string>;
  try {
    parsedMessage = await openpgp.readMessage({ armoredMessage });
  } catch (e) {
    throw new Error('Unable to parse the OpenPGP message: ' + (e instanceof Error ? e.message : String(e)));
  }

  // 2. Determination of candidates capable of decrypting the message
  const matchedRecords = await findMatchingKeyRecords(parsedMessage, keyRecords);
  if (matchedRecords.length === 0) {
    throw new Error("No imported OpenPGP key matches the recipients of this encrypted message.");
  }

  // 3. Attempt to decrypt with currently unlocked keys in session
  for (const keyRecord of matchedRecords) {
    const unlockedPrivateKey = unlockedKeys.get(keyRecord.id);
    if (!unlockedPrivateKey) continue; // The key matches but is locked

    try {
      console.log(`Attempt to decrypt with key ${keyRecord.id}...`); 
      
      const { data: decryptedBytes, signatures } = await openpgp.decrypt({
        message: parsedMessage,
        decryptionKeys: await clearArmoredPrivateKeyToPrivateKey(unlockedPrivateKey),
        verificationKeys: knownPublicKeys, // 💡 Passing public keys for nested signature
        format: 'binary'
      });
      console.log('signature:', signatures);
      return { 
        mimeBytes: decryptedBytes, 
        keyRecordId: keyRecord.id,
        signatures: signatures 
      };
    } catch (e) {
      console.warn(`Failed to decrypt with key ${keyRecord.id}, trying next...`, e);
      continue;
    }
  }

  // 4. Handling locked keys
  const lockedRecord = (await matchedRecords).find((record:any) => !unlockedKeys.has(record.id));
  if (lockedRecord) {
    throw new PgpKeyLockedError(
      'The PGP key is locked. Please enter your passphrase to decrypt.',
      lockedRecord.id,
    );
  }

  throw new Error('Failed to decrypt the message with available keys.');
}

/**
 * Identifies which local record IDs (keyRecords) are required for this message.
 * Useful for triggering the display of unlock pop-ups in the UI.
 */
export async function findDecryptionCandidates(cmsBytes: Uint8Array, keyRecords: KeyRecord[]) {
  try {
    const armoredMessage = normalizePgpMessage(cmsBytes);
    const parsedMessage = await openpgp.readMessage({ armoredMessage });
    return (await findMatchingKeyRecords(parsedMessage, keyRecords)).map((r) => r.id);
  } catch (e) {
    console.warn('Failed to find decryption candidates:', e);
    return [];
  }
}

/**
 * Filters the user's keyRecords to find those whose Key ID matches
 * one of the target Key IDs embedded in the packets of the PGP message.
 */


export async function findMatchingKeyRecords(
  parsedMessage: openpgp.Message<string> | openpgp.Message<Uint8Array>, 
  keyRecords: KeyRecord[]
): Promise<KeyRecord[]> {
  // 1. Extract the Key IDs (in uppercase hexadecimal) used to encrypt the message
  const encryptionKeyIds = parsedMessage.getEncryptionKeyIDs().map(id => id.toHex().toUpperCase());
  
  const matches: KeyRecord[] = [];

  for (const record of keyRecords) {
    if (!record.publicKey) continue;

    try {
      // 2. Parse the stored public key to get its true Key IDs (main key + subkeys)
      const keyInstance = await openpgp.readKey({ armoredKey: record.publicKey });
      const recordKeyIds = keyInstance.getKeyIDs().map(id => id.toHex().toUpperCase());

      // 3. Check if one of this key's Key IDs matches those required by the encrypted message
      const hasMatch = recordKeyIds.some(id => encryptionKeyIds.includes(id));

      if (hasMatch) {
        matches.push(record);
      }
    } catch (err) {
      // We ignore a malformed key in storage to not block the rest of the loop
      console.error(`Failed to parse public key for record ${record.id}:`, err);
    }
  }

  return matches;
}

/**
 * Cleans and normalizes the input (which can be binary or a string corrupted by JMAP transport)
 * to restore a clean ASCII Armored OpenPGP block.
 */
export function normalizePgpMessage(raw: Uint8Array | string): string {
  if (!raw || (typeof raw === 'string' && raw.trim() === '')) return '';

  let text = typeof raw === 'string' ? raw : new TextDecoder('utf-8', { fatal: false }).decode(raw);
  text = text.trim();

  if (text.includes('-----BEGIN PGP MESSAGE-----')) {
    return text;
  }

  // Fallback in case the ASCII armor was stripped but the data remains raw Base64
  // Extracts the base64 block and re-encapsulates with standard OpenPGP headers
  const cleanedBase64 = text.replace(/[^A-Za-z0-9+/=]/g, '');
  if (cleanedBase64.length > 32) {
    return `-----BEGIN PGP MESSAGE-----\n\n${cleanedBase64}\n-----END PGP MESSAGE-----`;
  }

  return text;
}