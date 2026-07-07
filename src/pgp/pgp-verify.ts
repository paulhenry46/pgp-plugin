/**
 * Verify OpenPGP message signatures (Inline and Detached/MIME).
 */

import * as openpgp from 'openpgp';
import { extractKeyInfo } from './key-utils.ts';

/**
 * Verifies a message's OpenPGP signature and extracts the full status as well as the content.
 * Supports both Inline/Cleartext mode and PGP/MIME mode (via pgpSignatureBlock).
 * @param {Uint8Array} contentBytes - The message bytes (the encrypted/MIME payload or the full block if Inline).
 * @param {string} fromHeader - The sender email address extracted from the email's "From" header.
 * @param {string|null} pgpSignatureBlock - Optional. The detached ASCII signature block (for PGP/MIME format).
 * @param {Array<openpgp.PublicKey>} [knownPublicKeys=[]] - Optional. Known public keys (e.g. retrieved from IndexedDB) used to validate the signature.
 * @returns {Promise<{ mimeBytes: Uint8Array, status: Object }>}
 */
export async function pgpVerify(contentBytes: Uint8Array, fromHeader: string, pgpSignatureBlock : string | null = null, knownPublicKeys: openpgp.PublicKey[] = []) {
  let verificationResult;
  let mimeBytes = contentBytes;

  try {
    if (pgpSignatureBlock) {
      // ── Case 1: PGP/MIME format (detached signature) ────────────────
      const message = await openpgp.createMessage({ binary: contentBytes });
      const signature = await openpgp.readSignature({ armoredSignature: pgpSignatureBlock });
      
      verificationResult = await openpgp.verify({
        message,
        signature,
        verificationKeys: knownPublicKeys // Pass the known keys here for validation
      });
    } else {
      // ── Case 2: PGP Inline format (wrapped signature or cleartext) ──
      const textContent = new TextDecoder('utf-8', { fatal: false }).decode(contentBytes);
      const message = await openpgp.readMessage({ armoredMessage: textContent });
      
      verificationResult = await openpgp.verify({
        message,
        verificationKeys: knownPublicKeys, // Pass the known keys here as well
        format: 'binary'
      });
      
      mimeBytes = verificationResult.data;
    }
  } catch (err) {
    return {
      mimeBytes,
      status: {
        isSigned: true,
        isEncrypted: false,
        signatureValid: false,
        signatureError: err instanceof Error ? err.message : 'Critical failure while parsing the signature',
      },
    };
  }

  // 3. Analyze signature validity
  let signatureValid = false;
  let signatureError = null;
  let signerPublicRecord = null;
  let signerEmailMatch = false;

  try {
    const signatures = verificationResult.signatures;
    if (signatures && signatures.length > 0) {
      const sig = signatures[0]; // Strictly follows the VerificationResult interface
      
      try {
        // 1. Wait for the 'verified' promise, which throws if the key is missing or invalid
        await sig.verified; 
        signatureValid = true;
      } catch (err) {
        signatureValid = false;
        signatureError = err instanceof Error ? err.message : 'Signature cryptographique invalide';
      }

      // 2. Retrieve the key ID in hexadecimal format for logs or error messages
      const signerKeyID = sig.keyID.toHex().toUpperCase();

      // 3. To find the signing key, search the 'knownPublicKeys' array
      //    for the one whose ID matches the signature ID.
      let signingKey = null;
      for (const key of knownPublicKeys) {
        if (key.getKeyID().toHex().toUpperCase() === signerKeyID) {
          signingKey = key;
          break;
        }
      }

      // If the key is among the trusted keys passed as arguments, extract its info
      if (signingKey) {
        const keyInfo = await extractKeyInfo(signingKey);
        const signerEmail = keyInfo.emailAddresses[0] ?? '';

  // Validate the key validity range
        const now = new Date();
        const notBefore = new Date(keyInfo.notBefore);
        const notAfter = keyInfo.notAfter ? new Date(keyInfo.notAfter) : null;
        
        if (now < notBefore && !signatureError) signatureError = 'The signer key is not yet valid';
        if (notAfter && now > notAfter && !signatureError) signatureError = 'The signer key has expired';
        
        if (signatureError) signatureValid = false;

        // Prepare the payload for the UI / IndexedDB
        signerPublicRecord = {
          id: `signer-${keyInfo.fingerprint.replace(/:/g, '')}`,
          email: signerEmail.toLowerCase(),
          publicKey: signingKey.toPublic().armor(),
          issuer: keyInfo.issuer,
          subject: keyInfo.subject,
          notBefore: keyInfo.notBefore,
          notAfter: keyInfo.notAfter,
          fingerprint: keyInfo.fingerprint,
          source: 'signed-email',
        };

        if (fromHeader && signerEmail) {
          signerEmailMatch = fromHeader.toLowerCase().trim() === signerEmail.toLowerCase().trim();
        }
      } else {
        // If the key was not in knownPublicKeys, the 'sig.verified' promise threw.
        // Make sure we still have an explicit message.
        signatureValid = false;
        if (!signatureError) {
          signatureError = `Unknown public key or missing from the local keyring (Key ID: ${signerKeyID}).`;
        }
      }
    } else {
      signatureError = 'No valid signature found in the OpenPGP structure';
    }
  } catch (err) {
    signatureValid = false;
    signatureError = 'Error while processing signature metadata: ' + (err instanceof Error ? err.message : String(err));
  }

  return {
    mimeBytes,
    status: {
      isSigned: true,
      isEncrypted: false,
      signatureValid,
      signatureError,
      signerCert: signerPublicRecord, 
      signerEmailMatch,
      selfSigned: true, 
    },
  };
}