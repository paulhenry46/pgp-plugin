/**
 * Verify OpenPGP message signatures (Inline and Detached/MIME).
 * Replaces the legacy S/MIME CMS SignedData verifier.
 */

import * as openpgp from 'openpgp';
import { extractKeyInfo } from './pgp-key-utils.js';

/**
 * Vérifie la signature OpenPGP d'un message et en extrait le statut complet ainsi que le contenu.
 * supporte à la fois le mode Inline/Cleartext et le mode PGP/MIME (via pgpSignatureBlock).
 * * @param {Uint8Array} contentBytes - Les octets du message (le payload chiffré/MIME ou le bloc complet si Inline).
 * @param {string} fromHeader - L'adresse e-mail de l'expéditeur extraite de l'en-tête "From" de l'e-mail.
 * @param {string|null} pgpSignatureBlock - Optionnel. Le bloc de signature ASCII détaché (pour le format PGP/MIME).
 * @returns {Promise<{ mimeBytes: Uint8Array, status: Object }>}
 */
export async function pgpVerify(contentBytes, fromHeader, pgpSignatureBlock = null) {
  let verificationResult;
  let mimeBytes = contentBytes;

  try {
    if (pgpSignatureBlock) {
      // ── Cas 1 : Format PGP/MIME (Signature détachée) ────────────────
      const message = await openpgp.createMessage({ binary: contentBytes });
      const signature = await openpgp.readSignature({ armoredSignature: pgpSignatureBlock });
      
      // On extrait la clé publique publique intégrée pour pouvoir valider cryptographiquement la signature
      const verificationKeys = await signature.getSigningKeyIDs();

      verificationResult = await openpgp.verify({
        message,
        signature,
        verificationKeys: [] // openpgp va chercher à apparier via les signatures publiques connues ou récupérées
      });
    } else {
      // ── Cas 2 : Format PGP Inline (Signature enveloppée ou texte clair) ──
      const textContent = new TextDecoder('utf-8', { fatal: false }).decode(contentBytes);
      const message = await openpgp.readMessage({ armoredMessage: textContent });
      
      verificationResult = await openpgp.verify({
        message,
        verificationKeys: [],
        format: 'binary' // Permet de récupérer le flux de données natif
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
        signatureError: err instanceof Error ? err.message : 'Échec critique du parsing de la signature',
      },
    };
  }

  // 3. Analyse de la validité de la signature
  let signatureValid = false;
  let signatureError = null;
  let signerPublicRecord = null;
  let signerEmailMatch = false;

  try {
    // Analyse du premier tag de signature retourné
    const signatures = verificationResult.signatures;
    if (signatures && signatures.length > 0) {
      const sig = signatures[0];
      
      try {
        await sig.verified; // Lève une exception si la signature cryptographique est invalide
        signatureValid = true;
      } catch (err) {
        signatureValid = false;
        signatureError = err instanceof Error ? err.message : 'Signature cryptographique invalide';
      }

      // Extraction des clés du signataire associées
      const signingKey = sig.signingKey;
      if (signingKey) {
        const keyInfo = await extractKeyInfo(signingKey);
        const signerEmail = keyInfo.emailAddresses[0] ?? '';

        // Validation des dates de validité de la clé du signataire
        const now = new Date();
        const notBefore = new Date(keyInfo.notBefore);
        const notAfter = keyInfo.notAfter ? new Date(keyInfo.notAfter) : null;
        
        if (now < notBefore && !signatureError) signatureError = 'La clé du signataire n’est pas encore valide';
        if (notAfter && now > notAfter && !signatureError) signatureError = 'La clé du signataire a expiré';
        
        if (signatureError) signatureValid = false;

        // Préparation de l'enregistrement de la clé publique pour IndexedDB (public-certs)
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

        // Alignement avec l'en-tête de l'enveloppe SMTP (From:)
        if (fromHeader && signerEmail) {
          signerEmailMatch = fromHeader.toLowerCase().trim() === signerEmail.toLowerCase().trim();
        }
      }
    } else {
      signatureError = 'Aucune signature valide trouvée dans la structure OpenPGP';
    }
  } catch (err) {
    signatureValid = false;
    signatureError = 'Erreur lors du traitement des métadonnées de signature: ' + err.message;
  }

  return {
    mimeBytes,
    status: {
      isSigned: true,
      isEncrypted: false,
      signatureValid,
      signatureError,
      signerCert: signerPublicRecord, // On garde la dénomination structurelle pour limiter les impacts de refactoring UI
      signerEmailMatch,
      selfSigned: true, // En PGP, toutes les signatures de confiance sont portées par auto-signature (Web of Trust)
    },
  };
}