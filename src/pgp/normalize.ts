/**
 * Normalize ASCII-armored OpenPGP messages received via JMAP.
 *
 * Some servers return the entire RFC 3156 MIME entity rather than the
 * ciphertext part. Extract the armored block without passing MIME headers,
 * boundaries, or the "Version: 1" control part to OpenPGP.
 */
export function normalizePgpMessage(raw: Uint8Array | string): string {
  if (!raw || (typeof raw === 'string' && raw.trim() === '')) return '';

  const text = (typeof raw === 'string'
    ? raw
    : new TextDecoder('utf-8', { fatal: false }).decode(raw)).trim();

  const beginMarker = '-----BEGIN PGP MESSAGE-----';
  const endMarker = '-----END PGP MESSAGE-----';
  const start = text.indexOf(beginMarker);

  if (start !== -1) {
    const end = text.indexOf(endMarker, start);
    return end === -1
      ? text.slice(start)
      : text.slice(start, end + endMarker.length);
  }

  // Keep the existing fallback for transports that provide raw Base64 without
  // armor headers. A short PGP/MIME control part ("Version: 1") is not armor.
  const cleanedBase64 = text.replace(/[^A-Za-z0-9+/=]/g, '');
  if (cleanedBase64.length > 32) {
    return `-----BEGIN PGP MESSAGE-----\n\n${cleanedBase64}\n-----END PGP MESSAGE-----`;
  }

  return text;
}
