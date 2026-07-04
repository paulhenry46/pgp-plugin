/**
 * OpenPGP message encryption implementation.
 * Replaces the legacy S/MIME CMS EnvelopedData generator.
 */

import * as openpgp from 'openpgp';

/**
 * Chiffre un contenu MIME ou textuel pour un ou plusieurs destinataires.
 * Inclut automatiquement la clé publique de l'expéditeur (sender) pour lui permettre
 * de relire ses propres messages dans le dossier "Messages envoyés".
 * * @param {Uint8Array} mimeBytes - Les octets du message à chiffrer.
 * @param {string[]} recipientPublicKeysArmored - Liste des clés publiques des destinataires (format ASCII Armored).
 * @param {string} senderPublicKeyArmored - Clé publique de l'expéditeur (format ASCII Armored).
 * @param {boolean} useAes128 - Si true, force AES-128, sinon utilise le standard AES-256.
 * @returns {Promise<Blob>} Un blob contenant le message chiffré au format ASCII Armored.
 */
export async function pgpEncrypt(mimeBytes, recipientPublicKeysArmored, senderPublicKeyArmored, useAes128) {
  // 1. Fusion et dédoublonnement des clés publiques (destinataires + expéditeur)
  const allKeyStrings = deduplicateKeys([...recipientPublicKeysArmored, senderPublicKeyArmored]);
  
  if (allKeyStrings.length === 0) {
    throw new Error('Aucune clé publique de destinataire ou d’expéditeur fournie.');
  }

  // 2. Parsing des clés pour l'API OpenPGP
  const encryptionKeys = [];
  for (const keyArmored of allKeyStrings) {
    try {
      const parsedKey = await openpgp.readKey({ armoredKey: keyArmored });
      encryptionKeys.push(parsedKey);
    } catch (e) {
      console.warn(`Impossible de lire une clé publique, elle sera ignorée: ${e.message}`);
    }
  }

  if (encryptionKeys.length === 0) {
    throw new Error('Échec du parsing de toutes les clés publiques fournies.');
  }

  // 3. Préparation du payload binaire
  const message = await openpgp.createMessage({ binary: mimeBytes });

  // 4. Configuration de l'algorithme symétrique (Session Key)
  // OpenPGP utilise par défaut AES-256 (recommandé)
  const algorithm = useAes128 ? openpgp.enums.symmetric.aes128 : openpgp.enums.symmetric.aes256;

  // 5. Chiffrement de bout en bout
  const encryptedArmored = await openpgp.encrypt({
    message,
    encryptionKeys,
    config: { preferredSymmetricAlgorithms: [algorithm] }
  });

  // 6. Retourne un Blob texte au format standard OpenPGP chiffré
  return new Blob([encryptedArmored], { type: 'application/pgp-encrypted; charset=utf-8' });
}

/**
 * Dédoublonne les chaînes de clés blindées pour éviter de chiffrer deux fois pour la même clé
 */
function deduplicateKeys(keys) {
  const seen = new Set();
  const result = [];
  for (const key of keys) {
    if (!key) continue;
    const trimmed = key.trim();
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
}