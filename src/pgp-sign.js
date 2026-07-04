/**
 * OpenPGP message signing implementation.
 * Replaces the legacy S/MIME CMS SignedData generator.
 */

import * as openpgp from 'openpgp';

/**
 * Signe un contenu MIME ou textuel en utilisant une clé privée OpenPGP déverrouillée.
 * Génère une signature combinée enveloppée (Armored OpenPGP Message binaire).
 * * @param {Uint8Array} mimeBytes - Les octets du message à signer (MIME ou texte brut).
 * @param {openpgp.PrivateKey} unlockedPrivateKey - L'objet clé privée OpenPGP déjà déverrouillé.
 * @returns {Promise<Blob>} Un blob contenant le message signé au format ASCII Armored.
 */
export async function pgpSign(mimeBytes, unlockedPrivateKey) {
  if (!unlockedPrivateKey || typeof unlockedPrivateKey.sign !== 'function') {
    throw new Error('Une clé privée OpenPGP valide et déverrouillée est requise pour signer.');
  }

  const message = await openpgp.createMessage({ binary: mimeBytes });

  const armoredSignedMessage = await openpgp.sign({
    message,
    signingKeys: unlockedPrivateKey,
    detached: false // false génère un message signé enveloppé
  });

  return new Blob([armoredSignedMessage], { type: 'application/pgp-signature; charset=utf-8' });
}

/**
 * Produit une signature PGP enveloppée (Inline) sous forme de Uint8Array.
 * Indispensable pour la phase "Sign-then-Encrypt" dans l'index avant chiffrement.
 * * @param {Uint8Array} mimeBytes 
 * @param {openpgp.PrivateKey} unlockedPrivateKey 
 * @returns {Promise<Uint8Array>} Les octets du bloc signé enveloppé textuel/binaire.
 */
export async function pgpSignInline(mimeBytes, unlockedPrivateKey) {
  if (!unlockedPrivateKey || typeof unlockedPrivateKey.sign !== 'function') {
    throw new Error('Une clé privée OpenPGP valide et déverrouillée est requise pour signer.');
  }

  const message = await openpgp.createMessage({ binary: mimeBytes });

  const armoredSignedMessage = await openpgp.sign({
    message,
    signingKeys: unlockedPrivateKey,
    detached: false
  });

  // On retourne un Uint8Array car l'index passe directement ce résultat au chiffreur
  return new TextEncoder().encode(armoredSignedMessage);
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