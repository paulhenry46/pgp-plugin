/**
 * OpenPGP key parsing + metadata extraction.
 * Replaces the legacy X.509 S/MIME certificate-utils implementation.
 */

import * as openpgp from 'openpgp';
import host from '@plugin-host';
import { importOpenPgpPublicKey } from './import.ts';
import { listPublicCerts } from '../storage.ts';
import { contacts } from '@plugin-host';
import { ContactCard, ContactEmail } from '../util.ts';
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
    if(item.userID){
      emails.push(item.userID?.email)
    }
  }
  
  return emails;
}


type KeyCapabilities = { canSign: boolean; canEncrypt: boolean };

/**
 * Determines the capabilities of a key (Encryption / Signature) by inspecting its packets.
 */
export function classifyCapabilities(key: openpgp.PublicKey | openpgp.PrivateKey): KeyCapabilities {
  let canSign = false;
  let canEncrypt = false;

  try {
    // 1. Detection of signature capability
    // Pass through the instance object (as any) to call the internal canSign() utility
    // or check if the key has components capable of signing.
    if (typeof (key as any).canSign === 'function') {
      canSign = (key as any).canSign();
    } else {
      // Fallback via the flags of the main packet
      canSign = !!key.keyPacket.algorithm; 
    }

    // 2. Detection of encryption capability
    // If the internal method or access to the encryption packet exists, canEncrypt is true.
    if (typeof (key as any).getEncryptionKeyPacket === 'function') {
      canEncrypt = true;
    }
  } catch {
    // In case of failure reading internal structures
    canSign = false;
    canEncrypt = false;
  }

  // Historical fallback if packet analysis fails but the algorithm is RSA
  if (!canSign && !canEncrypt) {
    try {
      const algName = String((key as any).getAlgorithmInfo?.().algorithm || '').toLowerCase();
      if (algName.includes('rsa')) {
        canSign = true;
        canEncrypt = true;
      }
    } catch {
      // Ignore
    }
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
    
  const capabilities = classifyCapabilities(key);
  
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
export async function scanAndImportKeysFromAttachments(attachments: any[]) {
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
            await maybeAutoImportSigner(contentStr);
          }
        } catch (attErr) {
          host.log.warn(`[PGP] Failed to read attachment ${att.name}`, attErr);
        }
      }
    }
};

async function maybeAutoImportSigner(pub:string) {
  if (host.plugin?.settings?.autoImportSignerCerts === false) return;
  const cert = pub; // Keep .signerCert for UI semantic compatibility
 
  try {
     const email =  await importOpenPgpPublicKey(cert);
  } catch (err) {
    host.log.warn('auto-import signer key failed', err);
  }
}

/**
 * Chiffre un texte fixe avec la clé AES existante pour créer le secret CryptPad.
 * Ne nécessite AUCUNE modification de ta fonction de dérivation d'origine !
 */
export async function deriveSecret(aesKey: CryptoKey, salt:string): Promise<string> {
  const enc = new TextEncoder();
  
  const messageFixe = enc.encode(salt);
  const iv = new Uint8Array(12); 

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    aesKey,
    messageFixe
  );
  const uint8Array = new Uint8Array(ciphertext);
  const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
  return btoa(binaryString);
}

export async function recipientKeysFor(emails: string[]): Promise<{
  found: Record<string, string>;
  missing: string[];
}> {
  const found: Record<string, string> = {};
  const missing: string[] = [];

  for (const email of emails) {
    const emailLower = email.toLowerCase();
    
    // 1. Recherche du contact correspondant à l'email
    const searchResults = await contacts.search(emailLower);
    const contact: ContactCard | undefined = searchResults.find((c) =>
      c.emails && Object.values(c.emails as Record<string, ContactEmail>).some((e) => e.address.toLowerCase() === emailLower)
    );

    let armoredKey: string | null = null;

    if (contact?.cryptoKeys) {
      // 2. On récupère la première clé PGP valide
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

    // 3. Attribution dans `found` ou `missing`
    if (armoredKey) {
      found[email] = armoredKey;
    } else {
      missing.push(email);
    }
  }

  return { found, missing };
}

export function decodePgpUri(uri: string): string {
  // Cas Data URI Base64
  if (uri.startsWith('data:')) {
    const base64Content = uri.split(',')[1];
    if (!base64Content) return '';
    
    // Décodage Base64 vers UTF-8 propre
    const binaryString = atob(base64Content);
    const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // Cas où l'URI contiendrait déjà directement le texte Armored
  return uri;
}