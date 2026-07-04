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
export function isPem(data) {
  if (typeof data !== 'string') return false;
  return /-----BEGIN PGP (PUBLIC KEY BLOCK|PRIVATE KEY BLOCK|MESSAGE|SIGNATURE)-----/.test(data);
}

// ── Key Parsing ─────────────────────────────────────────────────────

/**
 * Parse un bloc de clé publique ou privée OpenPGP (Armored ou binaire).
 * @param {string|Uint8Array} data 
 * @returns {Promise<openpgp.PublicKey|openpgp.PrivateKey>}
 */
export async function parsePgpKey(data) {
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
    throw new Error(`Échec du parsing de la clé OpenPGP : ${e.message}`);
  }
}

// ── Metadata Extraction ──────────────────────────────────────────────

/**
 * Extrait l'algorithme sous forme lisible (ex: RSA-4096, ECC-p256...)
 * @param {openpgp.PublicKey|openpgp.PrivateKey} key 
 * @returns {string}
 */
function extractAlgorithm(key) {
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
 * @param {openpgp.PublicKey|openpgp.PrivateKey} key 
 * @returns {string[]}
 */
function extractEmailAddresses(key) {
  const emails = [];
  const userIDs = key.getUserIDs();

  for (const userId of userIDs) {
    if (!userId) continue;
    const emailMatch = userId.match(/<([^>]+)>/);
    if (emailMatch && emailMatch[1]) {
      const email = emailMatch[1].toLowerCase().trim();
      if (!emails.includes(email)) {
        emails.push(email);
      }
    }
  }
  return emails;
}

/**
 * Détermine les capacités d'une clé (Chiffrement / Signature) en inspectant les sous-clés.
 * @param {openpgp.PublicKey|openpgp.PrivateKey} key 
 * @returns {{canSign: boolean, canEncrypt: boolean}}
 */
export function classifyCapabilities(key) {
  let canSign = false;
  let canEncrypt = false;

  // La clé principale ou ses sous-clés peuvent porter les flags de capacités
  const keysToEvaluate = [key, ...key.getSubkeys()];

  for (const k of keysToEvaluate) {
    try {
      const flags = k.getFlags();
      if (flags) {
        if (flags.sign) canSign = true;
        if (flags.encryptWholeMessage || flags.encryptCommunication) canEncrypt = true;
      }
    } catch {
      // getFlags() peut throw si aucun flag n'est défini, on fallback sur l'algo par défaut
      const algInfo = k.getAlgorithmInfo();
      if (algInfo.algorithm === 'rsa') {
        canSign = true;
        canEncrypt = true;
      }
    }
  }

  return { canSign, canEncrypt };
}

/**
 * Extrait la structure complète des métadonnées pour correspondre aux attentes du plugin.
 * @param {openpgp.PublicKey|openpgp.PrivateKey} key 
 * @returns {Promise<Object>}
 */
export async function extractKeyInfo(key) {
  const fingerprint = key.getFingerprint();
  const keyID = key.getKeyID().toHex().toUpperCase();
  const emails = extractEmailAddresses(key);
  const capabilities = classifyCapabilities(key);
  
  const primaryUser = await key.getPrimaryUser();
  const subject = primaryUser?.user?.userID?.userID || emails[0] || 'Unknown PGP User';

  const expirationTime = await key.getExpirationTime();
  const creationTime = key.getCreationTime();

  return {
    subject,                                      // Contient le User ID principal complet "Nom <email>"
    issuer: 'Self-Signed (OpenPGP Web of Trust)', // Les clés PGP s'auto-signent
    serialNumber: keyID,                         // L'identifiant court/long fait office de numéro de série
    notBefore: creationTime.toISOString(),
    notAfter: expirationTime ? expirationTime.toISOString() : null, // PGP autorise les clés sans expiration
    fingerprint: fingerprint.match(/.{1,4}/g).join(':'), // Formatage lisible XXXX:XXXX:XXXX...
    algorithm: extractAlgorithm(key),
    keyUsage: capabilities.canSign ? ['digitalSignature'] : [],
    extendedKeyUsage: [],
    emailAddresses: emails,
    capabilities,
  };
}