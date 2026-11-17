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
      // ── Case 1: PGP/MIME format (detached signature - RFC 3156) ────────
      let textContent = new TextDecoder('utf-8', { fatal: false }).decode(contentBytes);

      if (textContent.includes('multipart/signed') && textContent.includes('boundary=')) {
        textContent = extractPart1FromMultipartSigned(textContent);
      }

      // Force la canonicalisation CRLF (\r\n) conforme à la RFC 3156 / RFC 4880
      const canonicalizedText = textContent.replace(/\r?\n/g, '\r\n');

      // Utiliser createMessage avec text (et non createCleartextMessage pour éviter le dash-escaping sur les boundaries MIME)
      const message = await openpgp.createMessage({ text: canonicalizedText });
      const signature = await openpgp.readSignature({ armoredSignature: pgpSignatureBlock });

      verificationResult = await openpgp.verify({
        message,
        signature,
        verificationKeys: knownPublicKeys
      });

      mimeBytes = new TextEncoder().encode(canonicalizedText);
    } else {
      // ── Case 2: PGP Inline format ─────────────────────────────────────
      const textContent = new TextDecoder('utf-8', { fatal: false }).decode(contentBytes);
      const message = await openpgp.readMessage({ armoredMessage: textContent });

      verificationResult = await openpgp.verify({
        message,
        verificationKeys: knownPublicKeys,
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

      const signingKey = knownPublicKeys.find((key) => key.getKeys(sig.keyID).length > 0);

      // If the key is among the trusted keys passed as arguments, extract its info
      if (signingKey) {
        const keyInfo = await extractKeyInfo(signingKey);
        // The signer is the key's User ID matching the sender, if any (a key
        // bound to several addresses signs for each of them), else its first.
        const sender = fromHeader?.toLowerCase().trim();
        const signerEmail = keyInfo.emailAddresses.find((e: string) => e.toLowerCase() === sender)
          ?? keyInfo.emailAddresses[0] ?? '';

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
          signatureError = `Unknown public key or missing from the local keyring (Key ID: ${sig.keyID.toHex().toUpperCase()}).`;
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

/**
 * Extract part 1 of multipart/signed (RFC 3156)
 */
function extractPart1FromMultipartSigned(rawMimeText: string): string {
  // 1. serach boundary of multipart/signed
  const boundaryMatch = rawMimeText.match(/boundary=\s*"?([^";\r\n]+)"?/i);
  if (!boundaryMatch) return rawMimeText;

  const boundary = boundaryMatch[1].trim();
  const delimiter = `--${boundary}`;

  // 2. find the first delimiter
  const firstBoundaryIndex = rawMimeText.indexOf(delimiter);
  if (firstBoundaryIndex === -1) return rawMimeText;

  // find the start of content
  let startOfPart1 = rawMimeText.indexOf('\n', firstBoundaryIndex);
  if (startOfPart1 === -1) return rawMimeText;
  startOfPart1 += 1; // Avancer après le \n

  // 3. find the second delimiter
  const secondBoundaryIndex = rawMimeText.indexOf(delimiter, startOfPart1);
  if (secondBoundaryIndex === -1) return rawMimeText;

  // 4. extract part 1
  let part1 = rawMimeText.substring(startOfPart1, secondBoundaryIndex);

  // 5. RFC 1847 / RFC 3156 :
  // Le CRLF (\r\n ou \n) situated BEFORE the second délimiter
  // belong to delimiter and must be retrired from signed content.
  if (part1.endsWith('\r\n')) {
    part1 = part1.slice(0, -2);
  } else if (part1.endsWith('\n')) {
    part1 = part1.slice(0, -1);
  }

  return part1;
}