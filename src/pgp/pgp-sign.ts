import * as openpgp from 'openpgp';

/**
 * Signs MIME or text content using an unlocked OpenPGP private key.
 * Generates a combined wrapped signature (Armored OpenPGP binary message).
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