/**
 * OpenPGP message signing implementation.
 */

import * as openpgp from 'openpgp';

/**
 * Signs MIME or text content using an unlocked OpenPGP private key.
 * Generates a combined wrapped signature (Armored OpenPGP binary message).
 * @param {Uint8Array} mimeBytes - The bytes of the message to sign (MIME or plain text).
 * @param {openpgp.PrivateKey} unlockedPrivateKey - The already unlocked OpenPGP private key object.
 * @returns {Promise<Blob>} A blob containing the signed message in ASCII Armored format.
 */
export async function pgpSign(mimeBytes: Uint8Array, unlockedPrivateKey: openpgp.PrivateKey) {
  // Fix: Replacement of the non-existent method with the official status property of OpenPGP.js
  if (!unlockedPrivateKey || !unlockedPrivateKey.isDecrypted || !unlockedPrivateKey.isDecrypted()) {
    throw new Error('A valid unlocked OpenPGP private key is required to sign.');
  }

  const message = await openpgp.createMessage({ binary: mimeBytes });

  const armoredSignedMessage = await openpgp.sign({
    message,
    signingKeys: unlockedPrivateKey,
    detached: false // false generates a wrapped signed message (opaque)
  });

  return new Blob([armoredSignedMessage], { type: 'application/pgp-signature; charset=utf-8' });
}

/**
 * Produces a wrapped PGP signature (Inline) in the form of Uint8Array.
 * Essential for the "Sign-then-Encrypt" phase in the index before encryption.
 * @param {Uint8Array} mimeBytes 
 * @param {openpgp.PrivateKey} unlockedPrivateKey 
 * @returns {Promise<Uint8Array>} The bytes of the wrapped signed text/binary block.
 */
export async function pgpSignInline(mimeBytes: Uint8Array, unlockedPrivateKey: openpgp.PrivateKey) {
  if (!unlockedPrivateKey || !unlockedPrivateKey.isDecrypted || !unlockedPrivateKey.isDecrypted()) {
    throw new Error('A valid unlocked OpenPGP private key is required to sign.');
  }

  const message = await openpgp.createMessage({ binary: mimeBytes });

  const armoredSignedMessage = await openpgp.sign({
    message,
    signingKeys: unlockedPrivateKey,
    detached: false
  });

  // Returns a Uint8Array for transparent processing by the index encryption module
  return new TextEncoder().encode(armoredSignedMessage);
}

/**
 * Alternative: Produces a detached PGP signature (Useful for strict PGP/MIME format).
 * @param {Uint8Array} mimeBytes 
 * @param {openpgp.PrivateKey} unlockedPrivateKey 
 * @returns {Promise<Blob>} The signature block alone (without the message) in signature.asc format
 */
export async function pgpSignDetached(mimeBytes: Uint8Array, unlockedPrivateKey: openpgp.PrivateKey) {
  if (!unlockedPrivateKey || !unlockedPrivateKey.isDecrypted || !unlockedPrivateKey.isDecrypted()) {
    throw new Error('A valid unlocked OpenPGP private key is required to sign.');
  }

  const message = await openpgp.createMessage({ binary: mimeBytes });

  const armoredSignature = await openpgp.sign({
    message,
    signingKeys: unlockedPrivateKey,
    detached: true // True extracts only the -----BEGIN PGP SIGNATURE----- block
  });

  return new Blob([armoredSignature], { type: 'application/pgp-signature; name="signature.asc"' });
}