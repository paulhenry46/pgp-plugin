/**
 * OpenPGP key parsing + metadata extraction.
 * Replaces the legacy X.509 S/MIME certificate-utils implementation.
 */

import * as openpgp from 'openpgp';
import host from '@plugin-host';
import { importOpenPgpPublicKey } from './import.ts';
import { keyAddressFor } from './key-address.ts';
import { contacts } from '@plugin-host';
import { ContactCard, ContactEmail } from '../util.ts';
import type { KeyRecord } from '../storage.ts';
// ── Helpers & Conversions ───────────────────────────────────────────

/**
 * Checks if the string looks like an Armored OpenPGP block.
 * @param {string} data 
 * @returns {boolean}
 */
export function isPem(data: string): boolean {
  if (typeof data !== 'string') return false;
  return /-----BEGIN PGP (PUBLIC KEY BLOCK|PRIVATE KEY BLOCK|MESSAGE|SIGNATURE)-----/.test(data);
}

// ── Key Parsing ─────────────────────────────────────────────────────

/**
 * Parses a public or private OpenPGP key block (Armored or binary).
 * @param {string|Uint8Array} data 
 * @returns {Promise<openpgp.PublicKey|openpgp.PrivateKey>}
 */
export async function parsePgpKey(data: string | Uint8Array): Promise<openpgp.PublicKey | openpgp.PrivateKey> {
  const isString = typeof data === 'string';
  const input = isString ? data : new TextDecoder().decode(data);

  try {
    // First try to read as a private key, then as public
    if (input.includes('PRIVATE KEY BLOCK')) {
      return await openpgp.readPrivateKey({ armoredKey: input });
    } else {
      return await openpgp.readKey({ armoredKey: input });
    }
  } catch (e) {
    throw new Error(`Failed to parse OpenPGP key: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ── Metadata Extraction ──────────────────────────────────────────────

/**
 * Traverses the User IDs of a key to extract all valid email addresses.
 * @param {openpgp.Key} key 
 * @returns {string[]}
 */
function extractEmailAddresses(key: openpgp.PublicKey | openpgp.PrivateKey): string[] {
  const emails: string[] = [];
  const userIDs = key.users || [];

  for (const item of userIDs) {
    if(item.userID?.email){
      emails.push(item.userID.email)
    }
  }
  
  return emails;
}

/**
 * Every email address a key record is bound to (all its User IDs, lowercased).
 * Records imported before `emails` existed only stored their first User ID:
 * their addresses are read back from the stored public key.
 */
export async function keyRecordEmails(record: KeyRecord): Promise<string[]> {
  if (record.emails?.length) return record.emails;
  try {
    const key = await openpgp.readKey({ armoredKey: record.publicKey });
    const emails = extractEmailAddresses(key).map((e) => e.toLowerCase());
    if (emails.length) return emails;
  } catch {
    // Unreadable public key: fall back to the stored address
  }
  return record.email ? [record.email.toLowerCase()] : [];
}


type KeyCapabilities = { canSign: boolean; canEncrypt: boolean };

/**
 * Determines the capabilities of a key (Encryption / Signature) by inspecting its packets.
 */
export async function classifyCapabilities(
  key: openpgp.PublicKey | openpgp.PrivateKey
): Promise<KeyCapabilities> {
  let canSign = false;
  let canEncrypt = false;

  try {
    const encryptionKey = await key.getEncryptionKey();
    if (encryptionKey) {
      canEncrypt = true;
    }
  } catch {
    canEncrypt = false;
  }

  try {
    const signingKey = await key.getSigningKey();
    if (signingKey) {
      canSign = true;
    }
  } catch {
    canSign = false;
  }

  return { canSign, canEncrypt };
}

/**
 * Extracts the complete metadata structure to match the plugin's expectations.
 * Includes the 'armoredPublicKey' property required for key import.
 */
export async function extractKeyInfo(key: openpgp.PublicKey | openpgp.PrivateKey) {
  const fingerprint = key.getFingerprint();
  const keyID = key.getKeyID().toHex().toUpperCase();
  
  // Safe resolution of the external extractEmailAddresses function
  const emails: string[] = extractEmailAddresses(key);
    
  const capabilities = await classifyCapabilities(key);
  
  const primaryUser = await key.getPrimaryUser();
  const subject = primaryUser?.user?.userID?.userID || emails[0] || 'Unknown PGP User';

  // Normalization of temporal types (Date | number) returned by OpenPGP.js
  const creationTimeRaw = key.getCreationTime();
  const creationDate = creationTimeRaw instanceof Date ? creationTimeRaw : new Date(creationTimeRaw);

  const expirationTimeRaw = await key.getExpirationTime();
  let expirationIso: string | null = null;
  
  if (expirationTimeRaw && expirationTimeRaw !== Infinity) {
    const expirationDate = expirationTimeRaw instanceof Date ? expirationTimeRaw : new Date(expirationTimeRaw);
    expirationIso = expirationDate.toISOString();
  }

  // Format fingerprint by blocks of 4 characters separated by colons
  const fingerprintMatches = fingerprint.match(/.{1,4}/g);
  const formattedFingerprint = fingerprintMatches ? fingerprintMatches.join(':') : fingerprint;

  // Extract algorithm name via instance object
  let algorithmName = 'Unknown';
  try {
    if (typeof (key as any).getAlgorithmInfo === 'function') {
      algorithmName = String((key as any).getAlgorithmInfo().algorithm);
    }
  } catch {
    // Fallback
  }

  // Secure extraction and generation of the Armored public key block
  let armoredPublicKey = '';
  try {
    // If it's a private key, extract its public part with .toPublic()
    const publicKeyInstance = key.isPrivate() ? (key as openpgp.PrivateKey).toPublic() : key;
    armoredPublicKey = publicKeyInstance.armor();
  } catch (err) {
    throw new Error(`Failed to generate armored public key: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    subject,
    issuer: 'Self-Signed (OpenPGP Web of Trust)', 
    serialNumber: keyID,
    notBefore: creationDate.toISOString(),
    notAfter: expirationIso,
    fingerprint: formattedFingerprint, 
    algorithm: algorithmName,
    keyUsage: capabilities.canSign ? ['digitalSignature'] : [],
    extendedKeyUsage: [],
    emailAddresses: emails,
    capabilities,
    armoredPublicKey, // Add property expected by pgp-import.ts
  };
}

//  Scan of attachments from the decapsulated message
//  senderEmail: the message's From address; a key is only saved for it.
export async function scanAndImportKeysFromAttachments(attachments: any[], senderEmail: string) {
    if (!attachments || attachments.length === 0) return;
    for (const att of attachments) {
      // Target common extensions of PGP public keys or armor MIME type
      const isKeyExtension = att.name && (
        att.name.endsWith('.asc') || 
        att.name.endsWith('.key') || 
        att.name.endsWith('.pub')
      );
      const isKeyMime = att.contentType && (
        att.contentType.includes('application/pgp-keys') || 
        att.contentType.includes('text/pgp-public-key')
      );

      if (isKeyExtension || isKeyMime) {
        try {
          let contentStr = '';

          // If the framework already extracts the text content or bytes of the attachment:
          if (att.content) {
            contentStr = typeof att.content === 'string' 
              ? att.content 
              : new TextDecoder().decode(att.content);
          } 
          // Otherwise, if we need to fetch the bytes of the attachment sub-blob via the host:
          else if (att.blobId) {
            const blobBytes = await host.jmap.fetchBlob(att.blobId);
            contentStr = new TextDecoder().decode(blobBytes);
          }
          else if (att.dataUrl) {
          const dataUrlStr = String(att.dataUrl);
          
          // Check if the string uses base64 encoding
          if (dataUrlStr.includes(';base64,')) {
            const base64Part = dataUrlStr.split(';base64,')[1];
            if (base64Part) {
              // Decode Base64 string to binary string
              const decodedBinary = atob(base64Part.trim());
              // Use TextDecoder to ensure UTF-8 compliance
              const bytes = new Uint8Array(decodedBinary.length);
              for (let i = 0; i < decodedBinary.length; i++) {
                bytes[i] = decodedBinary.charCodeAt(i);
              }
              contentStr = new TextDecoder().decode(bytes);
            }
          } else if (dataUrlStr.includes(',')) {
            // If it's a raw dataUrl without base64 (e.g., data:text/plain,text...)
            const rawPart = dataUrlStr.split(',')[1];
            if (rawPart) {
              contentStr = decodeURIComponent(rawPart);
            }
          }
        }

          // If the file contains the standard armor, attempt import
          if (contentStr && contentStr.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
            await maybeAutoImportSigner(contentStr, senderEmail);
          }
        } catch (attErr) {
          host.log.warn(`[PGP] Failed to read attachment ${att.name}`, attErr);
        }
      }
    }
};

// A "no" to "save this sender's key?" is kept per address: it ends the offers
// for that address, whatever key the next message carries.
const KEY_OFFER_PREFIX = 'keyoffer:';
const pendingKeyOffers = new Set<string>();

/**
 * The other addresses of the contact an address belongs to. Keys are kept per
 * contact, so a key saved for one address is used for these too.
 */
async function otherAddressesOfContact(email: string): Promise<string[]> {
  const results: ContactCard[] = await contacts.search(email);
  const addressesOf = (c: ContactCard) =>
    Object.values((c.emails || {}) as Record<string, ContactEmail>).map((e) => String(e.address || '').toLowerCase());
  const contact = results.find((c) => addressesOf(c).includes(email));
  if (!contact) return [];
  return [...new Set(addressesOf(contact).filter((address) => address && address !== email))];
}

async function maybeAutoImportSigner(pub: string, senderEmail: string) {
  if (host.plugin?.settings?.autoImportSignerCerts === false) return;
  const sender = String(senderEmail || '').trim().toLowerCase();
  if (!sender) return;

  let needToRefresh = false;
  try {
    // Anyone can attach a key to a message, under any User ID, and write any
    // address in From. So a key from a message is:
    // - only ever saved for the sender's own address, and only when one of
    //   its User IDs carries that address;
    // - only offered while no key is saved for that address: it never joins
    //   or replaces one already there (a new key for a known contact is
    //   imported by hand);
    // - only saved once the user has said yes, with the fingerprint in front
    //   of them, because nothing here proves who sent the message;
    // - not offered again for an address once the user has said no: a sender
    //   cannot keep asking with a new key in each message.
    const { found } = await recipientKeysFor([sender]);
    if (found[sender]) return;

    const info = await extractKeyInfo(await openpgp.readKey({ armoredKey: pub }));
    if (!keyAddressFor(info.emailAddresses, sender)) return;

    const offerId = `${KEY_OFFER_PREFIX}${sender}`;
    if (pendingKeyOffers.has(offerId)) return;
    if (await host.storage.get(offerId)) return;

    pendingKeyOffers.add(offerId);
    try {
      let message = host.i18n.t('confirm.save_sender_key_message', { email: sender, fingerprint: info.fingerprint });
      const others = await otherAddressesOfContact(sender);
      if (others.length > 0) {
        message += `\n\n${host.i18n.t('confirm.save_sender_key_other_addresses', { addresses: others.join(', ') })}`;
      }
      const save = await host.ui.confirm({
        title: host.i18n.t('confirm.save_sender_key_title'),
        message,
        confirmLabel: host.i18n.t('confirm.save_sender_key_confirm'),
      });
      if (!save) {
        await host.storage.set(offerId, 'declined');
        return;
      }
      // The question can stay open for a while: a key may have been saved
      // for this address meanwhile (a lookup, an import by hand).
      if ((await recipientKeysFor([sender])).found[sender]) return;
      await importOpenPgpPublicKey(pub, sender);
      needToRefresh = true;
    } finally {
      pendingKeyOffers.delete(offerId);
    }
  } catch (err) {
    host.log.warn('auto-import signer key failed', err);
  }
  if(needToRefresh){ 
    host.ui.rerenderEmail();
  }
}

export async function deriveSecret(hmacKey: CryptoKey, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(salt);

  const signature = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    data
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export type RecipientKeys = { found: Record<string, string>; missing: string[] };


export async function recipientKeysFor(emails: string[]): Promise<RecipientKeys> {
  const found: Record<string, string> = {};
  const missing: string[] = [];

  for (const email of emails) {
    const emailLower = email.toLowerCase();
    
    // 1. search contacts for a matching email address and retrieve the first PGP key found
    const searchResults = await contacts.search(emailLower);
    const contact: ContactCard | undefined = searchResults.find((c) =>
      c.emails && Object.values(c.emails as Record<string, ContactEmail>).some((e) => e.address.toLowerCase() === emailLower)
    );

    let armoredKey: string | null = null;

    if (contact?.cryptoKeys) {
      // 2. we get the first cryptoKey entry that is of type PGP
      const cryptoKeyEntry = Object.values(contact.cryptoKeys).find(
        (key) => key.mediaType === 'application/pgp-keys' || key.uri.startsWith('data:application/pgp-keys')
      );

      if (cryptoKeyEntry?.uri) {
        try {
          armoredKey = decodePgpUri(cryptoKeyEntry.uri);
        } catch (e) {
          armoredKey = null;
        }
      }
    }

    // 3. attribute the found armored key to the email or mark it as missing
    if (armoredKey) {
      found[email] = armoredKey;
    } else {
      missing.push(email);
    }
  }

  return { found, missing };
}

export function decodePgpUri(uri: string): string {
  // URI Base64
  if (uri.startsWith('data:')) {
    const base64Content = uri.split(',')[1];
    if (!base64Content) return '';
    
    //  Base64 to UTF-8
    const binaryString = atob(base64Content);
    const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // if URI is not a data URI, return it as is (assuming it's already an armored key)
  return uri;
}