/**
 * Detect S/MIME content in an email message. Ported from lib/smime/smime-detect.ts.
 * Checks Content-Type, JMAP bodyStructure, and attachment metadata.
 */

export function detectSmime(contentType, bodyStructure, attachments) {
  const noResult = { type: null, supported: false };

  if (contentType) {
    const ct = contentType.toLowerCase();

    if (ct.includes('application/pkcs7-mime') || ct.includes('application/x-pkcs7-mime')) {
      if (ct.includes('smime-type=enveloped-data')) {
        const part = findCmsPart(bodyStructure, 'enveloped-data');
        return { type: 'enveloped-data', blobId: part?.blobId, partId: part?.partId, supported: true };
      }
      if (ct.includes('smime-type=signed-data')) {
        const part = findCmsPart(bodyStructure, 'signed-data');
        return { type: 'signed-data', blobId: part?.blobId, partId: part?.partId, supported: true };
      }
      const part = findCmsPart(bodyStructure, null);
      if (part) {
        const partType = inferSmimeTypeFromContentType(part.type || '');
        return {
          type: partType,
          blobId: part.blobId,
          partId: part.partId,
          supported: partType === 'enveloped-data' || partType === 'signed-data',
        };
      }
    }

    if (ct.includes('multipart/signed') && ct.includes('application/pkcs7-signature')) {
      return { type: 'detached-sig', supported: false };
    }
  }

  if (bodyStructure) {
    const result = walkBodyStructure(bodyStructure);
    if (result) return result;
  }

  if (attachments) {
    for (const att of attachments) {
      const type = att.type?.toLowerCase() || '';
      const name = att.name?.toLowerCase() || '';

      if (type.includes('application/pkcs7-mime') || type.includes('application/x-pkcs7-mime')) {
        const smimeType = inferSmimeTypeFromContentType(type);
        return {
          type: smimeType,
          blobId: att.blobId,
          partId: att.partId,
          supported: smimeType === 'enveloped-data' || smimeType === 'signed-data',
        };
      }
      if (name.endsWith('.p7m')) {
        return { type: 'enveloped-data', blobId: att.blobId, partId: att.partId, supported: true };
      }
      if (name.endsWith('.p7s')) {
        return { type: 'detached-sig', blobId: att.blobId, partId: att.partId, supported: false };
      }
    }
  }

  return noResult;
}

function walkBodyStructure(part) {
  const type = part.type?.toLowerCase() || '';

  if (type.includes('application/pkcs7-mime') || type.includes('application/x-pkcs7-mime')) {
    const smimeType = inferSmimeTypeFromContentType(type);
    return {
      type: smimeType,
      blobId: part.blobId,
      partId: part.partId,
      supported: smimeType === 'enveloped-data' || smimeType === 'signed-data',
    };
  }

  if (type === 'multipart/signed') {
    if (part.subParts?.some((sp) => sp.type?.toLowerCase().includes('application/pkcs7-signature'))) {
      return { type: 'detached-sig', supported: false };
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

function findCmsPart(bodyStructure, _smimeType) {
  if (!bodyStructure) return null;
  const type = bodyStructure.type?.toLowerCase() || '';
  if (type.includes('application/pkcs7-mime') || type.includes('application/x-pkcs7-mime')) {
    return bodyStructure;
  }
  if (bodyStructure.subParts) {
    for (const sub of bodyStructure.subParts) {
      const found = findCmsPart(sub, _smimeType);
      if (found) return found;
    }
  }
  return null;
}

function inferSmimeTypeFromContentType(ct) {
  const lower = ct.toLowerCase();
  if (lower.includes('smime-type=enveloped-data')) return 'enveloped-data';
  if (lower.includes('smime-type=signed-data')) return 'signed-data';
  if (lower.includes('application/pkcs7-mime') || lower.includes('application/x-pkcs7-mime')) {
    return 'enveloped-data';
  }
  return null;
}
