/**
 * Decrypt OpenPGP encrypted messages using local keys.
 * Replaces the legacy S/MIME CMS EnvelopedData decoder.
 */

import * as openpgp from 'openpgp';
import {KeyRecord} from './key-storage.ts'; // Importez l'interface KeyRecord générée à l'étape précédente

export class PgpKeyLockedError extends Error {
  public keyRecordId: string;
  constructor(message: string, keyRecordId: string) {
    super(message);
    this.name = 'PgpKeyLockedError';
    this.keyRecordId = keyRecordId;
  }
}

/**
 * Tente de déchiffrer un message OpenPGP.
 * @param {Object} input
 * @param {Uint8Array} input.cmsBytes - Les octets du message chiffré OpenPGP.
 * @param {Array} input.keyRecords - Les métadonnées des clés privées de l'utilisateur issues d'IndexedDB.
 * @param {Map} input.unlockedKeys - Map (keyRecordId -> openpgp.PrivateKey déverrouillée) pour cette session.
 * @returns {Promise<{ mimeBytes: Uint8Array, keyRecordId: string }>}
 */
export async function pgpDecrypt(input: { cmsBytes: Uint8Array, keyRecords: KeyRecord[], unlockedKeys: Map<string, openpgp.PrivateKey> }) {
  const { cmsBytes, keyRecords, unlockedKeys } = input;

  // 1. Normalisation de la charge utile d'entrée
  console.log('[plugin:smime] : CmsBytes :' ,cmsBytes);
  const armoredMessage = normalizePgpMessage(cmsBytes);
  console.log('[plugin:smime] : armored :' ,armoredMessage);
  let parsedMessage;
  try {
    parsedMessage = await openpgp.readMessage({ armoredMessage });
  } catch (e) {
    throw new Error('Impossible de parser le message OpenPGP : ' + (e instanceof Error ? e.message : String(e)));
  }

  // 2. Détermination des candidats capables de déchiffrer le message
  const matchedRecords = await findMatchingKeyRecords(parsedMessage, keyRecords);
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
  const lockedRecord = (await matchedRecords).find((record:any) => !unlockedKeys.has(record.id));
  if (lockedRecord) {
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
 * Filtre les keyRecords de l'utilisateur pour trouver ceux dont le Key ID correspond
 * à l'un des Key IDs cibles intégrés dans les paquets du message PGP.
 */


export async function findMatchingKeyRecords(
  parsedMessage: openpgp.Message<string> | openpgp.Message<Uint8Array>, 
  keyRecords: KeyRecord[]
): Promise<KeyRecord[]> {
  // 1. Extraire les Key IDs (en hexadécimal majuscule) qui ont servi à chiffrer le message
  const encryptionKeyIds = parsedMessage.getEncryptionKeyIDs().map(id => id.toHex().toUpperCase());
  
  const matches: KeyRecord[] = [];

  for (const record of keyRecords) {
    if (!record.publicKey) continue;

    try {
      // 2. Parser la clé publique stockée pour obtenir ses véritables Key IDs (clé principale + sous-clés)
      const keyInstance = await openpgp.readKey({ armoredKey: record.publicKey });
      const recordKeyIds = keyInstance.getKeyIDs().map(id => id.toHex().toUpperCase());

      // 3. Vérifier si l'un des Key IDs de cette clé correspond à ceux demandés par le message chiffré
      const hasMatch = recordKeyIds.some(id => encryptionKeyIds.includes(id));

      if (hasMatch) {
        matches.push(record);
      }
    } catch (err) {
      // On ignore une clé mal formée dans le stockage pour ne pas bloquer le reste de la boucle
      console.error(`Failed to parse public key for record ${record.id}:`, err);
    }
  }

  return matches;
}

/**
 * Nettoie et normalise l'entrée (qui peut être du binaire ou une chaîne malmenée par le transport JMAP)
 * pour restituer un bloc ASCII Armored OpenPGP propre.
 */
export function normalizePgpMessage(raw: Uint8Array | string): string {
  if (!raw || (typeof raw === 'string' && raw.trim() === '')) return '';

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