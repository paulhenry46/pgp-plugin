/**
 * Decrypt OpenPGP encrypted messages using local keys.
 * Replaces the legacy S/MIME CMS EnvelopedData decoder.
 */

import * as openpgp from 'openpgp';

export class PgpKeyLockedError extends Error {
  constructor(message, keyRecordId) {
    super(message);
    this.name = 'PgpKeyLockedError';
    this.keyRecordId = keyRecordId;
  }
}

/**
 * Tente de déchiffrer un message OpenPGP.
 * @param {Object} input
 * @param {Uint8Array|string} input.cmsBytes - Les octets ou le texte du message chiffré OpenPGP.
 * @param {Array} input.keyRecords - Les métadonnées des clés privées de l'utilisateur issues d'IndexedDB.
 * @param {Map} input.unlockedKeys - Map (keyRecordId -> openpgp.PrivateKey déverrouillée) pour cette session.
 * @returns {Promise<{ mimeBytes: Uint8Array, keyRecordId: string }>}
 */
export async function pgpDecrypt(input) {
  const { cmsBytes, keyRecords, unlockedKeys } = input;

  // 1. Normalisation de la charge utile d'entrée
  const armoredMessage = normalizePgpMessage(cmsBytes);

  let parsedMessage;
  try {
    parsedMessage = await openpgp.readMessage({ armoredMessage });
  } catch (e) {
    throw new Error('Impossible de parser le message OpenPGP : ' + e.message);
  }

  // 2. Détermination des candidats capables de déchiffrer le message
  const matchedRecords = findMatchingKeyRecords(parsedMessage, keyRecords);
  if (matchedRecords.length === 0) {
    throw new Error("Aucune clé OpenPGP importée ne correspond aux destinataires de ce message chiffré.");
  }

  // 3. Tentative de déchiffrement avec les clés actuellement déverrouillées en session
  for (const keyRecord of matchedRecords) {
    const unlockedPrivateKey = unlockedKeys.get(keyRecord.id);
    if (!unlockedPrivateKey) continue; // La clé correspond mais est verrouillée (absente de la Map de session)

    try {
      const { data: decryptedBytes } = await openpgp.decrypt({
        message: parsedMessage,
        decryptionKeys: unlockedPrivateKey,
        format: 'binary' // Pour récupérer un Uint8Array exploitable par src/mime-parse.js
      });

      return { mimeBytes: decryptedBytes, keyRecordId: keyRecord.id };
    } catch (e) {
      console.warn(`Échec de déchiffrement avec la clé ${keyRecord.id}, tentative suivante...`, e);
      continue; // Erreur crypto ou mauvaise sous-clé, on tente le candidat suivant
    }
  }

  // 4. Gestion des clés verrouillées (Demande d'UI via l'exception)
  // Si on arrive ici, aucune clé déverrouillée n'a fonctionné. On vérifie s'il y a des candidats dormants.
  const hasLockedMatch = matchedRecords.some((record) => !unlockedKeys.has(record.id));
  if (hasLockedMatch) {
    const lockedRecord = matchedRecords.find((record) => !unlockedKeys.has(record.id));
    throw new PgpKeyLockedError(
      'La clé PGP est verrouillée. Veuillez saisir votre phrase de passe pour déchiffrer.',
      lockedRecord.id,
    );
  }

  throw new Error('Échec du déchiffrement du message avec les clés disponibles.');
}

/**
 * Identifie quels ID de enregistrements locaux (keyRecords) sont requis pour ce message.
 * Utile pour déclencher l'affichage des pop-ups de déverrouillage dans l'UI.
 */
export function findDecryptionCandidates(cmsBytes, keyRecords) {
  try {
    const armoredMessage = normalizePgpMessage(cmsBytes);
    const parsedMessage = openpgp.readMessage({ armoredMessage });
    return findMatchingKeyRecords(parsedMessage, keyRecords).map((r) => r.id);
  } catch {
    return [];
  }
}

/**
 * Filtre les keyRecords de l'utilisateur pour trouver ceux dont le Key ID correspond
 * à l'un des Key IDs cibles intégrés dans les paquets du message PGP.
 */
function findMatchingKeyRecords(parsedMessage, keyRecords) {
  // openpgp.js expose les ID de clés requis sous forme de tableau d'objets KeyID
  const encryptionKeyIds = parsedMessage.getReaderEncryptionKeyIDs().map(id => id.toHex().toUpperCase());
  
  const matches = [];
  for (const record of keyRecords) {
    if (!record.keyID) continue;
    
    // Un enregistrement correspond si son KeyID principal ou sa sous-clé est listé dans le message
    const cleanRecordKeyId = record.keyID.toUpperCase();
    if (encryptionKeyIds.includes(cleanRecordKeyId)) {
      matches.push(record);
    }
  }
  return matches;
}

/**
 * Nettoie et normalise l'entrée (qui peut être du binaire ou une chaîne malmenée par le transport JMAP)
 * pour restituer un bloc ASCII Armored OpenPGP propre.
 */
export function normalizePgpMessage(raw) {
  if (!raw || raw.byteLength === 0) return '';

  let text = typeof raw === 'string' ? raw : new TextDecoder('utf-8', { fatal: false }).decode(raw);
  text = text.trim();

  if (text.includes('-----BEGIN PGP MESSAGE-----')) {
    return text;
  }

  // Fallback au cas où le blindage ASCII a été dépouillé mais que les données restent du Base64 brut
  // Extrait le bloc base64 et ré-encapsule avec les en-têtes standard OpenPGP
  const cleanedBase64 = text.replace(/[^A-Za-z0-9+/=]/g, '');
  if (cleanedBase64.length > 32) {
    return `-----BEGIN PGP MESSAGE-----\n\n${cleanedBase64}\n-----END PGP MESSAGE-----`;
  }

  return text;
}