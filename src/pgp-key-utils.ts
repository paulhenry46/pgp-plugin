/**
 * OpenPGP key parsing + metadata extraction.
 * Replaces the legacy X.509 S/MIME certificate-utils implementation.
 */

import * as openpgp from 'openpgp';

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