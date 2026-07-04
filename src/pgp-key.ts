/**
 * OpenPGP Key Import + private-key encryption-at-rest / unlock.
 * Replaces the legacy PKCS#12 / S/MIME implementation.
 */

import * as openpgp from 'openpgp';
import { generateUUID } from './util.ts';

/**
 * Import a PGP Private Key block (ASCII Armored string).
 * Parses metadata and re-encrypts the private key with a local passphrase if necessary.
 * * @param {string} PgpPrivateKeyArmored - Le bloc de texte "-----BEGIN PGP PRIVATE KEY BLOCK-----"
 * @param {string} currentKeyPassphrase - Le mot de passe actuel de la clé PGP (si elle est déjà chiffrée)
 * @param {string} storagePassphrase - Le mot de passe maître de l'extension pour sécuriser la clé au repos
 */
export async function importPgpKey(pgpPrivateKeyArmored: string, currentKeyPassphrase: string, storagePassphrase: string) {
  let privateKey;
  try {
    privateKey = await openpgp.readPrivateKey({ armoredKey: pgpPrivateKeyArmored });
  } catch (e) {
    throw new Error('Échec du parsing de la clé OpenPGP : ' + (e instanceof Error ? e.message : String(e)));
  }

  // Tente de déverrouiller la clé originale si elle est chiffrée
  if (!privateKey.isDecrypted()) {
    try {
      privateKey = await openpgp.decryptKey({
        privateKey,
        passphrase: currentKeyPassphrase
      });
    } catch {
      throw new Error('Mot de passe de la clé PGP incorrect');
    }
  }

  // Extrait l'identifiant (User ID) et l'e-mail
  const primaryUser = await privateKey.getPrimaryUser();
  if (!primaryUser || !primaryUser.user) {
    throw new Error("Aucun ID d'utilisateur valide trouvé dans cette clé PGP");
  }

  if (!primaryUser || !primaryUser.user || !primaryUser.user.userID) {
    throw new Error("Aucun ID d'utilisateur valide trouvé dans cette clé PGP");
  }

  const userIdStr = primaryUser.user.userID.userID; // Format standard: "John Doe <john@example.com>"
  const emailMatch = userIdStr.match(/<([^>]+)>/);
  const email = emailMatch ? emailMatch[1].toLowerCase() : '';

  // Extraction des informations sur la clé
  const fingerprint = privateKey.getFingerprint();
  const keyID = privateKey.getKeyID().toHex();
  const creationTime = privateKey.getCreationTime();
  const expirationTime = await privateKey.getExpirationTime();

  // Chiffrement de la clé privée pour le stockage local (Encryption-at-rest)
  // OpenPGP.js intègre nativement son propre mécanisme de dérivation KDF robuste (S2K)
  const encryptedPrivateKey = await openpgp.encryptKey({
    privateKey,
    passphrase: storagePassphrase
  });

  const publicKeyArmored = privateKey.toPublic().armor();

  const keyRecord = {
    id: generateUUID(),
    email: email.toLowerCase(),
    publicKey: publicKeyArmored,               // Remplace 'certificate'
    encryptedPrivateKey: encryptedPrivateKey,  // Stocké sous forme de chaîne blindée chiffrée
    fingerprint: fingerprint,
    keyID: keyID,
    userId: userIdStr,
    notBefore: creationTime,
    notAfter: expirationTime || null,          // Une clé PGP peut ne jamais expirer
    algorithm: privateKey.getAlgorithmInfo().algorithm,
    capabilities: {
      canSign: true,                           // Les clés PGP principales ou leurs sous-clés gèrent généralement les deux
      canEncrypt: true
    }
  };

  const certInfo = {
    emailAddresses: [email],
    fingerprint,
    subject: userIdStr
  };

  return { keyRecord, certInfo };
}

/**
 * Déverrouille la clé privée stockée dans IndexedDB et retourne un objet clé OpenPGP utilisable.
 * * @param {Object} record - Le document extrait de la base IndexedDB
 * @param {string} passphrase - Le mot de passe de l'extension saisi par l'utilisateur
 * @returns {Promise<{unlockedPrivateKey: openpgp.PrivateKey}>}
 */
export async function unlockPrivateKey(record: any, passphrase: string) {
  let encryptedKey;
  try {
    encryptedKey = await openpgp.readPrivateKey({ armoredKey: record.encryptedPrivateKey });
  } catch {
    throw new Error('Impossible de lire la clé privée chiffrée en base de données');
  }

  try {
    const unlockedPrivateKey = await openpgp.decryptKey({
      privateKey: encryptedKey,
      passphrase: passphrase
    });
    
    // Retourne un objet compatible avec l'API OpenPGP.js pour la signature et le déchiffrement
    return { unlockedPrivateKey };
  } catch {
    throw new Error('Mot de passe de stockage incorrect');
  }
}