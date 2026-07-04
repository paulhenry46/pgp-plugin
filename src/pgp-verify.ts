/**
 * Verify OpenPGP message signatures (Inline and Detached/MIME).
 * Replaces the legacy S/MIME CMS SignedData verifier.
 */

import * as openpgp from 'openpgp';
import { extractKeyInfo } from './pgp-key-utils.js';

/**
 * Vérifie la signature OpenPGP d'un message et en extrait le statut complet ainsi que le contenu.
 * Supporte à la fois le mode Inline/Cleartext et le mode PGP/MIME (via pgpSignatureBlock).
 * @param {Uint8Array} contentBytes - Les octets du message (le payload chiffré/MIME ou le bloc complet si Inline).
 * @param {string} fromHeader - L'adresse e-mail de l'expéditeur extraite de l'en-tête "From" de l'e-mail.
 * @param {string|null} pgpSignatureBlock - Optionnel. Le bloc de signature ASCII détaché (pour le format PGP/MIME).
 * @param {Array<openpgp.PublicKey>} [knownPublicKeys=[]] - Optionnel. Clés publiques connues (ex: récupérées depuis IndexedDB) pour valider la signature.
 * @returns {Promise<{ mimeBytes: Uint8Array, status: Object }>}
 */
export async function pgpVerify(contentBytes: Uint8Array, fromHeader: string, pgpSignatureBlock : string | null = null, knownPublicKeys: openpgp.PublicKey[] = []) {
  let verificationResult;
  let mimeBytes = contentBytes;

  try {
    if (pgpSignatureBlock) {
      // ── Cas 1 : Format PGP/MIME (Signature détachée) ────────────────
      const message = await openpgp.createMessage({ binary: contentBytes });
      const signature = await openpgp.readSignature({ armoredSignature: pgpSignatureBlock });
      
      verificationResult = await openpgp.verify({
        message,
        signature,
        verificationKeys: knownPublicKeys // On passe les clés connues ici pour la validation
      });
    } else {
      // ── Cas 2 : Format PGP Inline (Signature enveloppée ou texte clair) ──
      const textContent = new TextDecoder('utf-8', { fatal: false }).decode(contentBytes);
      const message = await openpgp.readMessage({ armoredMessage: textContent });
      
      verificationResult = await openpgp.verify({
        message,
        verificationKeys: knownPublicKeys, // On passe les clés connues ici aussi
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
    const signatures = verificationResult.signatures;
    if (signatures && signatures.length > 0) {
      const sig = signatures[0]; // Respecte strictement l'interface VerificationResult
      
      try {
        // 1. On attend la promesse 'verified' qui lève une exception si la clé est manquante ou invalide
        await sig.verified; 
        signatureValid = true;
      } catch (err) {
        signatureValid = false;
        signatureError = err instanceof Error ? err.message : 'Signature cryptographique invalide';
      }

      // 2. Récupération de l'ID de clé au format Hexa pour les logs ou messages d'erreur
      const signerKeyID = sig.keyID.toHex().toUpperCase();

      // 3. Pour retrouver la clé qui a signé, on cherche dans le tableau 'knownPublicKeys' 
      //    celle dont l'ID correspond à l'ID de la signature.
      let signingKey = null;
      for (const key of knownPublicKeys) {
        if (key.getKeyID().toHex().toUpperCase() === signerKeyID) {
          signingKey = key;
          break;
        }
      }

      // Si la clé fait partie de vos clés de confiance passées en argument, on extrait ses infos
      if (signingKey) {
        const keyInfo = await extractKeyInfo(signingKey);
        const signerEmail = keyInfo.emailAddresses[0] ?? '';

        // Validation des plages de validité de la clé
        const now = new Date();
        const notBefore = new Date(keyInfo.notBefore);
        const notAfter = keyInfo.notAfter ? new Date(keyInfo.notAfter) : null;
        
        if (now < notBefore && !signatureError) signatureError = 'La clé du signataire n’est pas encore valide';
        if (notAfter && now > notAfter && !signatureError) signatureError = 'La clé du signataire a expiré';
        
        if (signatureError) signatureValid = false;

        // Préparation du payload pour l'UI / IndexedDB
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
        // Si la clé n'était pas dans knownPublicKeys, la promesse 'sig.verified' a levé une exception.
        // On s'assure d'avoir un message explicite.
        signatureValid = false;
        if (!signatureError) {
          signatureError = `Clé publique inconnue ou absente du trousseau local (Key ID: ${signerKeyID}).`;
        }
      }
    } else {
      signatureError = 'Aucune signature valide trouvée dans la structure OpenPGP';
    }
  } catch (err) {
    signatureValid = false;
    signatureError = 'Erreur lors du traitement des métadonnées de signature: ' + (err instanceof Error ? err.message : String(err));
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