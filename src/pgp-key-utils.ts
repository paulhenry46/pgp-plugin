/**
 * OpenPGP key parsing + metadata extraction.
 * Replaces the legacy X.509 S/MIME certificate-utils implementation.
 */

import * as openpgp from 'openpgp';
import host from '@plugin-host';
import { listPublicCerts, savePublicCert } from './key-storage.ts';
import { generateUUID } from './util.ts';
import { importOpenPgpPublicKey } from './pgp-import.ts';
// ── Helpers & Conversions ───────────────────────────────────────────

/**
 * Vérifie si la chaîne de caractères ressemble à un bloc OpenPGP blindé (Armored).
 * @param {string} data 
 * @returns {boolean}
 */
export function isPem(data: string): boolean {
  if (typeof data !== 'string') return false;
  return /-----BEGIN PGP (PUBLIC KEY BLOCK|PRIVATE KEY BLOCK|MESSAGE|SIGNATURE)-----/.test(data);
}

// ── Key Parsing ─────────────────────────────────────────────────────

/**
 * Parse un bloc de clé publique ou privée OpenPGP (Armored ou binaire).
 * @param {string|Uint8Array} data 
 * @returns {Promise<openpgp.PublicKey|openpgp.PrivateKey>}
 */
export async function parsePgpKey(data: string | Uint8Array): Promise<openpgp.PublicKey | openpgp.PrivateKey> {
  const isString = typeof data === 'string';
  const input = isString ? data : new TextDecoder().decode(data);

  try {
    // On essaie d'abord de lire comme une clé privée, puis comme publique
    if (input.includes('PRIVATE KEY BLOCK')) {
      return await openpgp.readPrivateKey({ armoredKey: input });
    } else {
      return await openpgp.readKey({ armoredKey: input });
    }
  } catch (e) {
    throw new Error(`Échec du parsing de la clé OpenPGP : ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ── Metadata Extraction ──────────────────────────────────────────────

/**
 * Extrait l'algorithme sous forme lisible (ex: RSA-4096, ECC-p256...)
 * @param {openpgp.PublicKey|openpgp.PrivateKey} key 
 * @returns {string}
 */
function extractAlgorithm(key: openpgp.PublicKey | openpgp.PrivateKey): string {
  try {
    const info = key.getAlgorithmInfo();
    if (info.bits) {
      return `${info.algorithm.toUpperCase()}-${info.bits}`;
    }
    return info.algorithm.toUpperCase(); // Pour ECC (Curve25519, p256...)
  } catch {
    return 'UNKNOWN';
  }
}

/**
 * Parcourt les User IDs d'une clé pour en extraire toutes les adresses e-mail valides.
 * @param {openpgp.Key} key 
 * @returns {string[]}
 */
function extractEmailAddresses(key: openpgp.PublicKey | openpgp.PrivateKey): string[] {
  console.log('extract');
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
 * Détermine les capacités d'une clé (Chiffrement / Signature) en inspectant ses paquets.
 */
export function classifyCapabilities(key: openpgp.PublicKey | openpgp.PrivateKey): KeyCapabilities {
  let canSign = false;
  let canEncrypt = false;

  try {
    // 1. Détection de la capacité de signature
    // On passe par l'objet d'instance (as any) pour appeler l'utilitaire interne canSign()
    // ou on vérifie si la clé possède des composants capables de signer.
    if (typeof (key as any).canSign === 'function') {
      canSign = (key as any).canSign();
    } else {
      // Alternative de secours via les drapeaux du paquet principal
      canSign = !!key.keyPacket.algorithm; 
    }

    // 2. Détection de la capacité de chiffrement
    // Si la méthode interne ou l'accès au paquet de chiffrement existe, canEncrypt est vrai.
    if (typeof (key as any).getEncryptionKeyPacket === 'function') {
      canEncrypt = true;
    }
  } catch {
    // En cas d'échec de lecture des structures internes
    canSign = false;
    canEncrypt = false;
  }

  // Fallback historique si l'analyse des paquets échoue mais que l'algorithme est du RSA
  if (!canSign && !canEncrypt) {
    try {
      const algName = String((key as any).getAlgorithmInfo?.().algorithm || '').toLowerCase();
      if (algName.includes('rsa')) {
        canSign = true;
        canEncrypt = true;
      }
    } catch {
      // Ignorer
    }
  }

  return { canSign, canEncrypt };
}

/**
 * Extrait la structure complète des métadonnées pour correspondre aux attentes du plugin.
 * Inclut la propriété 'armoredPublicKey' requise pour l'importation de clé.
 */
export async function extractKeyInfo(key: openpgp.PublicKey | openpgp.PrivateKey) {
  console.log(key);
  const fingerprint = key.getFingerprint();
  const keyID = key.getKeyID().toHex().toUpperCase();
  
  // Résolution sécurisée de la fonction externe extractEmailAddresses
  const emails: string[] = extractEmailAddresses(key);
    
  const capabilities = classifyCapabilities(key);
  
  const primaryUser = await key.getPrimaryUser();
  const subject = primaryUser?.user?.userID?.userID || emails[0] || 'Unknown PGP User';

  // Normalisation des types temporels (Date | number) retournés par OpenPGP.js
  const creationTimeRaw = key.getCreationTime();
  const creationDate = creationTimeRaw instanceof Date ? creationTimeRaw : new Date(creationTimeRaw);

  const expirationTimeRaw = await key.getExpirationTime();
  let expirationIso: string | null = null;
  
  if (expirationTimeRaw && expirationTimeRaw !== Infinity) {
    const expirationDate = expirationTimeRaw instanceof Date ? expirationTimeRaw : new Date(expirationTimeRaw);
    expirationIso = expirationDate.toISOString();
  }

  // Formatage du fingerprint par blocs de 4 caractères séparés par des deux-points
  const fingerprintMatches = fingerprint.match(/.{1,4}/g);
  const formattedFingerprint = fingerprintMatches ? fingerprintMatches.join(':') : fingerprint;

  // Extraction du nom de l'algorithme via l'objet d'instance
  let algorithmName = 'Unknown';
  try {
    if (typeof (key as any).getAlgorithmInfo === 'function') {
      algorithmName = String((key as any).getAlgorithmInfo().algorithm);
    }
  } catch {
    // Fallback
  }

  // Extraction et génération sécurisée du bloc Armored de la clé publique
  let armoredPublicKey = '';
  try {
    // Si c'est une clé privée, on extrait sa partie publique avec .toPublic()
    const publicKeyInstance = key.isPrivate() ? (key as openpgp.PrivateKey).toPublic() : key;
    armoredPublicKey = publicKeyInstance.armor();
  } catch (err) {
    console.error('Failed to export armored public key string from instance', err);
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
    armoredPublicKey, // Ajout de la propriété attendue par pgp-import.ts
  };
}

// 💡 NOUVEAU : Scan des pièces jointes du message décapsulé
  export async function scanAndImportKeysFromAttachments(attachments: any[]) {
    if (!attachments || attachments.length === 0) return;
    console.log(`[PGP] Scan des pièces jointes pour les clés PGP`, attachments);
    for (const att of attachments) {
      // On cible les extensions courantes de clés publiques PGP ou le type MIME armor
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

          // Si le framework extrait déjà le contenu textuel ou les bytes de la pièce jointe :
          if (att.content) {
            contentStr = typeof att.content === 'string' 
              ? att.content 
              : new TextDecoder().decode(att.content);
          } 
          // Sinon, si on doit aller chercher les bytes du sous-blob de la pièce jointe via l'hôte :
          else if (att.blobId) {
            const blobBytes = await host.jmap.fetchBlob(att.blobId);
            contentStr = new TextDecoder().decode(blobBytes);
          }
          else if (att.dataUrl) {
          const dataUrlStr = String(att.dataUrl);
          
          // On vérifie si la chaîne utilise l'encodage base64
          if (dataUrlStr.includes(';base64,')) {
            const base64Part = dataUrlStr.split(';base64,')[1];
            if (base64Part) {
              // Décodage de la chaîne Base64 en chaîne de caractères binaire
              const decodedBinary = atob(base64Part.trim());
              // Utilisation de TextDecoder pour s'assurer du respect de l'UTF-8
              const bytes = new Uint8Array(decodedBinary.length);
              for (let i = 0; i < decodedBinary.length; i++) {
                bytes[i] = decodedBinary.charCodeAt(i);
              }
              contentStr = new TextDecoder().decode(bytes);
            }
          } else if (dataUrlStr.includes(',')) {
            // Si c'est un dataUrl brut sans base64 (ex: data:text/plain,texte...)
            const rawPart = dataUrlStr.split(',')[1];
            if (rawPart) {
              contentStr = decodeURIComponent(rawPart);
            }
          }
        }

          // Si le fichier contient bien l'armure standard, on tente l'import
          if (contentStr && contentStr.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
            await maybeAutoImportSigner(contentStr);
          }
        } catch (attErr) {
          host.log.warn(`[PGP] Échec de la lecture de la pièce jointe ${att.name}`, attErr);
        }
      }
    }
  };

async function maybeAutoImportSigner(pub:string) {
  console.log('maybeAutoImportSigner', pub);
  if (host.plugin?.settings?.autoImportSignerCerts === false) return;
  const cert = pub; // On garde .signerCert pour la compatibilité sémantique de l'UI
 
  try {
     const email =  await importOpenPgpPublicKey(cert);
  } catch (err) {
    host.log.warn('auto-import signer key failed', err);
  }
}