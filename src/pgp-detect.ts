/**
 * Detect OpenPGP content in an email message.
 * Replaces the legacy S/MIME implementation.
 * Checks Content-Type, JMAP bodyStructure, attachment metadata, and inline text.
 */

export interface PgpDetectionResult {
  type: 'pgp-inline-encrypted' | 'pgp-inline-signed' | 'pgp-mime-encrypted' | 'pgp-mime-signed' | 'pgp-encrypted-file' | 'pgp-signature-file' | null;
  supported: boolean;
  blobId?: string | null;
  partId?: string | null;
  signatureBlobId?: string | null;
}

export function detectPgp(contentType: string, bodyStructure: any, attachments: any[], textBody: string): PgpDetectionResult {
  const noResult: PgpDetectionResult = { type: null, supported: false };

  // 1. Détection du mode PGP INLINE (Corps textuel brut)
  if (textBody && typeof textBody === 'string') {
    if (textBody.includes('-----BEGIN PGP MESSAGE-----')) {
      return { type: 'pgp-inline-encrypted', supported: true };
    }
    if (textBody.includes('-----BEGIN PGP SIGNED MESSAGE-----')) {
      return { type: 'pgp-inline-signed', supported: true };
    }
  }

  // 2. Détection via le Content-Type principal (PGP/MIME - RFC 3156)
  if (contentType) {
    const ct = contentType.toLowerCase();

    if (ct.includes('multipart/encrypted') && ct.includes('protocol="application/pgp-encrypted"')) {
      const part = findPgpMimePart(bodyStructure, 'application/pgp-encrypted');
      return { 
        type: 'pgp-mime-encrypted', 
        blobId: bodyStructure?.blobId || part?.blobId, // On préfère le blob global pour le déchiffrement complet
        partId: part?.partId, 
        supported: true 
      };
    }

    if (ct.includes('multipart/signed') && ct.includes('protocol="application/pgp-signature"')) {
      const sigPart = findPgpMimePart(bodyStructure, 'application/pgp-signature');
      // En PGP/MIME signé, le blobId principal (le contenu à vérifier) est souvent le premier enfant du multipart
      const contentPart = bodyStructure?.subParts?.[0]; 
      return { 
        type: 'pgp-mime-signed', 
        blobId: contentPart?.blobId || bodyStructure?.blobId, 
        partId: contentPart?.partId || bodyStructure?.partId, 
        signatureBlobId: sigPart?.blobId, 
        supported: true 
      };
    }
  }

  // 3. Détection en parcourant l'arborescence structurelle JMAP / MIME
  if (bodyStructure) {
    const result = walkBodyStructure(bodyStructure);
    if (result) return result;
  }

  // 4. Détection via les pièces jointes (fichiers .asc, .pgp, .sig)
  if (attachments) {
    for (const att of attachments) {
      const type = att.type?.toLowerCase() || '';
      const name = att.name?.toLowerCase() || '';

      if (type.includes('application/pgp-encrypted')) {
        return { type: 'pgp-mime-encrypted', blobId: att.blobId, partId: att.partId, supported: true };
      }
      if (type.includes('application/pgp-signature')) {
        return { type: 'pgp-mime-signed', blobId: att.blobId, partId: att.partId, signatureBlobId: att.blobId, supported: true };
      }
      
      // Fallback par extension de fichier
      if (name.endsWith('.pgp') || name.endsWith('.asc')) {
        return { type: 'pgp-encrypted-file', blobId: att.blobId, partId: att.partId, supported: true };
      }
      if (name.endsWith('.sig')) {
        return { type: 'pgp-signature-file', blobId: att.blobId, partId: att.partId, signatureBlobId: att.blobId, supported: true };
      }
    }
  }

  return noResult;
}

/**
 * Parcourt récursivement l'arborescence des parties de l'e-mail
 * Aligné pour retourner un PgpDetectionResult valide
 */
function walkBodyStructure(part: any): PgpDetectionResult | null {
  if (!part) return null;
  const type = part.type?.toLowerCase() || '';

  // Cas direct : La partie elle-même est du contenu PGP
  if (type.includes('application/pgp-encrypted')) {
    return { type: 'pgp-mime-encrypted', blobId: part.blobId, partId: part.partId, supported: true };
  }
  if (type.includes('application/pgp-signature')) {
    return { type: 'pgp-mime-signed', blobId: part.blobId, partId: part.partId, signatureBlobId: part.blobId, supported: true };
  }

  // Cas conteneur : Gestion des structures multiparts imbriquées
  if (type === 'multipart/encrypted' || type === 'multipart/signed') {
    const subParts = part.subParts || [];
    
    const hasPgp = subParts.some((sp: any) => {
      const sType = sp.type?.toLowerCase() || '';
      return sType.includes('application/pgp-encrypted') || sType.includes('application/pgp-signature');
    });

    if (hasPgp) {
      if (type === 'multipart/encrypted') {
        const encryptedControlPart = subParts.find((sp: any) => sp.type?.toLowerCase().includes('application/pgp-encrypted'));
        return { 
          type: 'pgp-mime-encrypted', 
          blobId: part.blobId || encryptedControlPart?.blobId, 
          partId: encryptedControlPart?.partId, 
          supported: true 
        };
      } else {
        // multipart/signed : Séparation obligatoire du contenu et de sa signature détachée
        const contentPart = subParts[0]; // Généralement l'enveloppe de texte/html à signer
        const signaturePart = subParts.find((sp: any) => sp.type?.toLowerCase().includes('application/pgp-signature'));
        return {
          type: 'pgp-mime-signed',
          blobId: contentPart?.blobId || part.blobId,
          partId: contentPart?.partId || part.partId,
          signatureBlobId: signaturePart?.blobId || null,
          supported: true
        };
      }
    }
  }

  // Descente récursive dans l'arbre JMAP
  if (part.subParts) {
    for (const sub of part.subParts) {
      const result = walkBodyStructure(sub);
      if (result) return result;
    }
  }

  return null;
}

/**
 * Trouve la sous-partie spécifique correspondant au protocole PGP demandé
 */
function findPgpMimePart(bodyStructure: any, protocolType: string): any | null {
  if (!bodyStructure) return null;
  const type = bodyStructure.type?.toLowerCase() || '';
  if (type.includes(protocolType)) {
    return bodyStructure;
  }
  if (bodyStructure.subParts) {
    for (const sub of bodyStructure.subParts) {
      const found = findPgpMimePart(sub, protocolType);
      if (found) return found;
    }
  }
  return null;
}