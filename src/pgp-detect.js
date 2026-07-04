/**
 * Detect OpenPGP content in an email message.
 * Replaces the legacy S/MIME implementation.
 * Checks Content-Type, JMAP bodyStructure, attachment metadata, and inline text.
 */

export function detectPgp(contentType, bodyStructure, attachments, textBody) {
  const noResult = { type: null, supported: false };

  // 1. Détection du mode PGP INLINE (Le plus fréquent dans le corps du texte)
  // On vérifie d'abord si le texte brut contient des marqueurs PGP alternatifs
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
        blobId: part?.blobId, 
        partId: part?.partId, 
        supported: true 
      };
    }

    if (ct.includes('multipart/signed') && ct.includes('protocol="application/pgp-signature"')) {
      const part = findPgpMimePart(bodyStructure, 'application/pgp-signature');
      return { 
        type: 'pgp-mime-signed', 
        blobId: part?.blobId, 
        partId: part?.partId, 
        supported: true // On bascule à true car on va supporter la vérification PGP
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
        return { type: 'pgp-mime-signed', blobId: att.blobId, partId: att.partId, supported: true };
      }
      
      // Fallback par extension de fichier
      if (name.endsWith('.pgp') || name.endsWith('.asc')) {
        // Souvent les pièces jointes chiffrées finissent par .pgp/.asc
        return { type: 'pgp-encrypted-file', blobId: att.blobId, partId: att.partId, supported: true };
      }
      if (name.endsWith('.sig')) {
        return { type: 'pgp-signature-file', blobId: att.blobId, partId: att.partId, supported: true };
      }
    }
  }

  return noResult;
}

/**
 * Parcourt récursivement l'arborescence des parties de l'e-mail
 */
function walkBodyStructure(part) {
  const type = part.type?.toLowerCase() || '';

  if (type.includes('application/pgp-encrypted')) {
    return { type: 'pgp-mime-encrypted', blobId: part.blobId, partId: part.partId, supported: true };
  }
  if (type.includes('application/pgp-signature')) {
    return { type: 'pgp-mime-signed', blobId: part.blobId, partId: part.partId, supported: true };
  }

  if (type === 'multipart/encrypted' || type === 'multipart/signed') {
    const hasPgp = part.subParts?.some((sp) => {
      const sType = sp.type?.toLowerCase() || '';
      return sType.includes('application/pgp-encrypted') || sType.includes('application/pgp-signature');
    });
    if (hasPgp) {
      const targetPart = part.subParts.find((sp) => 
        sp.type?.toLowerCase().includes('application/pgp-encrypted') || 
        sp.type?.toLowerCase().includes('application/pgp-signature')
      );
      return { 
        type: type === 'multipart/encrypted' ? 'pgp-mime-encrypted' : 'pgp-mime-signed', 
        blobId: targetPart?.blobId, 
        partId: targetPart?.partId, 
        supported: true 
      };
    }
  }

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
function findPgpMimePart(bodyStructure, protocolType) {
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