/**
 * OpenPGP message signing implementation.
 * Replaces the legacy S/MIME CMS SignedData generator.
 */

import * as openpgp from 'openpgp';

/**
 * Signe un contenu MIME ou textuel en utilisant une clé privée OpenPGP déverrouillée.
 * Génère une signature combinée enveloppée (Cleartext Signature ou Armored OpenPGP Message).
 * * @param {Uint8Array} mimeBytes - Les octets du message à signer (MIME ou texte brut).
 * @param {openpgp.PrivateKey} unlockedPrivateKey - L'objet clé privée OpenPGP déjà déverrouillé.
 * @returns {Promise<Blob>} Un blob contenant le message signé au format ASCII Armored.
 */
export async function pgpSign(mimeBytes, unlockedPrivateKey) {
  if (!unlockedPrivateKey || typeof unlockedPrivateKey.sign !== 'function') {
    throw new Error('Une clé privée OpenPGP valide et déverrouillée est requise pour signer.');
  }

  // Conversion du Uint8Array en chaîne ou en flux compatible OpenPGP
  // Note: OpenPGP prend en charge les Uint8Array directement pour créer des messages binaires/littéraux
  const message = await openpgp.createMessage({
    binary: mimeBytes
  });

  // Génération du message signé
  // Par défaut, openpgp.sign produit un bloc ASCII Armored (texte) contenant le payload + la signature détachable imbriquée
  const armoredSignedMessage = await openpgp.sign({
    message,
    signingKeys: unlockedPrivateKey,
    detached: false // false génère un message signé enveloppé (semblable à l'opaque signé de S/MIME)
  });

  // Retourne un Blob texte au format standard OpenPGP
  return new Blob([armoredSignedMessage], { type: 'application/pgp-signature; charset=utf-8' });
}

/**
 * Alternative : Produit une signature PGP détachée (Utile pour le format PGP/MIME strict).
 * * @param {Uint8Array} mimeBytes 
 * @param {openpgp.PrivateKey} unlockedPrivateKey 
 * @returns {Promise<Blob>} Le bloc de signature seule (sans le message) au format signature.asc
 */
export async function pgpSignDetached(mimeBytes, unlockedPrivateKey) {
  const message = await openpgp.createMessage({ binary: mimeBytes });

  const armoredSignature = await openpgp.sign({
    message,
    signingKeys: unlockedPrivateKey,
    detached: true // True extrait uniquement le bloc -----BEGIN PGP SIGNATURE-----
  });

  return new Blob([armoredSignature], { type: 'application/pgp-signature; name="signature.asc"' });
}