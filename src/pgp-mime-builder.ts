/**
 * Deterministic MIME builder for outgoing PGP messages.
 * Uses 'mimetext' to generate correct and robust MIME trees,
 * and packages them according to RFC 3156 (PGP/MIME).
 */

import { createMimeMessage } from 'mimetext/browser';
import { generateUUID } from './util.ts';

const CRLF = '\r\n';

/**
 * Construit un message MIME standard non chiffré (corps + pièces jointes).
 * Cette sortie brute (Cleartext MIME) sera ensuite passée à `pgpEncrypt` ou `pgpSign`.
 * @param {Object} input 
 * @returns {Uint8Array} Les octets du message MIME structuré.
 */
export function buildMimeMessage(input: any): Uint8Array {
  const msg = createMimeMessage();
  console.log('build mime 1');
  // 1. En-têtes basiques
  msg.setSender(input.from);
  console.log('build mime 11');
  msg.setTo(input.to);
  console.log('build mime 111');
  if (input.cc?.length) msg.setCc(input.cc);
  console.log('build mime 00');
  msg.setSubject(input.subject);
  console.log('build mime 2222');
  if (input.inReplyTo) msg.setHeader('In-Reply-To', input.inReplyTo);
  if (input.references?.length) msg.setHeader('References', input.references.join(' '));
  console.log('build mime 2');
  // Custom Message-ID si fourni, sinon généré par mimetext
  if (input.messageId) {
    msg.setHeader('Message-ID', input.messageId);
  }
  console.log('build mime 3');
  // 2. Gestion du corps (Texte / HTML)
  if (input.textBody) msg.addMessage({ contentType: 'text/plain', data: input.textBody });
  if (input.htmlBody) msg.addMessage({ contentType: 'text/html', data: input.htmlBody });

  // 3. Gestion des pièces jointes
  if (input.attachments?.length) {
    for (const att of input.attachments) {
      msg.addAttachment({ filename: att.filename, contentType: att.contentType, data: base64EncodeRaw(att.content) });
    }
  }

  // Génère la chaîne brute MIME (gère nativement les boundaries et le quoted-printable)
  const rawMimeString = msg.asRaw();
  return new TextEncoder().encode(rawMimeString);
}

/**
 * Encapsule un payload chiffré par OpenPGP dans une structure stricte PGP/MIME Chiffrée (RFC 3156 Section 4).
 * @param {Blob|string} pgpEncryptedBlob - Le bloc ASCII Armored généré par `pgpEncrypt`.
 * @param {Object} input - Les métadonnées d'en-tête de l'e-mail.
 * @returns {Blob} Un blob au format message/rfc822 prêt à l'envoi.
 */
export function wrapAsPgpMimeEncrypted(pgpEncryptedBlob: Blob | string, input: any): Blob {
  const boundary = generateBoundary();
  const lines = [];

  // En-têtes globaux du message de transport
  lines.push(formatHeader('From', formatAddress(input.from)));
  // 1. On force input.to à être un tableau (gère le cas où c'est une string unique)
    const toEntries = Array.isArray(input.to) ? input.to : [input.to];

    // 2. On extrait proprement l'adresse mail (gère le cas où ce sont des objets {email: ...} ou des strings)
    const cleanTo = toEntries
      .map((t: any) => typeof t === 'string' ? t : (t.email || t.addr || ''))
      .filter(Boolean); // Supprime les entrées vides s'il y en a

    // 3. On pousse dans le tableau de lignes
    lines.push(formatHeader('To', cleanTo.join(', ')));
  
  if (input.cc?.length) lines.push(formatHeader('Cc', input.cc.map(formatAddress).join(', ')));
  lines.push(formatHeader('Subject', encodeHeaderValue(input.subject)));
  lines.push(formatHeader('Date', formatDate(input.date ?? new Date())));
  lines.push(formatHeader('Message-ID', input.messageId ?? `<${generateUUID()}@pgp.local>`));
  if (input.inReplyTo) lines.push(formatHeader('In-Reply-To', input.inReplyTo));
  if (input.references?.length) lines.push(formatHeader('References', input.references.join(' ')));
  lines.push('MIME-Version: 1.0');
  
  // Content-Type strict pour PGP/MIME Chiffré (RFC 3156)
  lines.push(`Content-Type: multipart/encrypted; protocol="application/pgp-encrypted"; boundary="${boundary}"`);
  lines.push('');

  // Première partie : Le signal de contrôle obligatoire (Version 1)
  lines.push(`--${boundary}`);
  lines.push('Content-Type: application/pgp-encrypted');
  lines.push('Content-Description: PGP/MIME version identification');
  lines.push('');
  lines.push('Version: 1');
  lines.push('');

  // Deuxième partie : Le payload chiffré lui-même
  lines.push(`--${boundary}`);
  lines.push('Content-Type: application/octet-stream; name="encrypted.asc"');
  lines.push('Content-Description: OpenPGP encrypted message');
  lines.push('Content-Disposition: inline; filename="encrypted.asc"');
  // AJOUT : Indique au parseur que c'est du texte brut 7bit/8bit 
  // Cela isole le bloc OpenPGP des en-têtes MIME ci-dessus.
  lines.push('Content-Transfer-Encoding: 7bit'); 
  lines.push(''); // Saut de ligne obligatoire après le dernier en-tête MIME

  // On s'assure que lines se termine bien par un CRLF propre avant d'injecter le blob
  const headerBytes = new TextEncoder().encode(lines.join(CRLF) + CRLF);
  const closingBytes = new TextEncoder().encode(`${CRLF}--${boundary}--${CRLF}`);

  // On assemble les en-têtes, le texte asymétrique chiffré et la balise de fermeture du multipart
  return new Blob([headerBytes, pgpEncryptedBlob, closingBytes], { type: 'application/octet-stream' });
}

/**
 * Encapsule un payload et sa signature détachée dans une structure stricte PGP/MIME Signée (RFC 3156 Section 5).
 * @param {Uint8Array} clearMimeBytes - Le contenu MIME d'origine généré par `buildMimeMessage`.
 * @param {Blob|string} pgpSignatureBlob - Le bloc ASCII Armored de la signature seule (généré par `pgpSignDetached`).
 * @param {Object} input - Les métadonnées d'en-tête de l'e-mail.
 * @returns {Blob} Un blob au format message/rfc822 prêt à l'envoi.
 */
export function wrapAsPgpMimeSigned(clearMimeBytes: Blob | string, pgpSignatureBlob: Blob | string, input: any): Blob {
  const boundary = generateBoundary();
  const lines = [];

  // En-têtes globaux du message de transport
  lines.push(formatHeader('From', formatAddress(input.from)));
  // 1. On force input.to à être un tableau (gère le cas où c'est une string unique)
    const toEntries = Array.isArray(input.to) ? input.to : [input.to];

    // 2. On extrait proprement l'adresse mail (gère le cas où ce sont des objets {email: ...} ou des strings)
    const cleanTo = toEntries
      .map((t: string) => t)
      .filter(Boolean); // Supprime les entrées vides s'il y en a

    // 3. On pousse dans le tableau de lignes
    lines.push(formatHeader('To', cleanTo.join(', ')));
  if (input.cc?.length) lines.push(formatHeader('Cc', input.cc.map(formatAddress).join(', ')));
  lines.push(formatHeader('Subject', encodeHeaderValue(input.subject)));
  lines.push(formatHeader('Date', formatDate(input.date ?? new Date())));
  lines.push(formatHeader('Message-ID', input.messageId ?? `<${generateUUID()}@pgp.local>`));
  if (input.inReplyTo) lines.push(formatHeader('In-Reply-To', input.inReplyTo));
  if (input.references?.length) lines.push(formatHeader('References', input.references.join(' ')));
  lines.push('MIME-Version: 1.0');
  
  // Content-Type strict pour PGP/MIME Signé (L'en-tête micalg SHA-256 est standard)
  lines.push(`Content-Type: multipart/signed; micalg=pgp-sha256; protocol="application/pgp-signature"; boundary="${boundary}"`);
  lines.push('');

  // Première partie : Le contenu MIME lisible complet (avec ses propres sous-composants, images, etc.)
  lines.push(`--${boundary}`);
  
  const initialHeaderBytes = new TextEncoder().encode(lines.join(CRLF) + CRLF);
  
  // Deuxième partie : La signature détachée mise à la fin
  const middleLines = [];
  middleLines.push('');
  middleLines.push(`--${boundary}`);
  middleLines.push('Content-Type: application/pgp-signature; name="signature.asc"');
  middleLines.push('Content-Description: OpenPGP digital signature');
  middleLines.push('Content-Disposition: attachment; filename="signature.asc"');
  middleLines.push('');

  const middleBytes = new TextEncoder().encode(middleLines.join(CRLF));
  const closingBytes = new TextEncoder().encode(`${CRLF}--${boundary}--${CRLF}`);
  const blob = new Blob([initialHeaderBytes, clearMimeBytes, middleBytes, pgpSignatureBlob, closingBytes], { type: 'message/rfc822' })
  return blob;
}

// ── Low-Level Format Helpers (Conservés pour les enveloppes de transport) ─────────────────

function generateBoundary() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `----=_Part_${hex}`;
}

function formatAddress(addr: { name?: string; addr: string }) {
  if (addr.name) {
    const escaped = addr.name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}" <${addr.addr}>`;
  }
  return addr.addr;
}

function formatHeader(name: string, value: string) {
  const full = `${name}: ${value}`;
  if (full.length <= 76) return full;
  const parts = [];
  let remaining = full;
  let first = true;
  while (remaining.length > 76) {
    let breakAt = 76;
    const spaceIdx = remaining.lastIndexOf(' ', 76);
    if (spaceIdx > (first ? name.length + 2 : 1)) breakAt = spaceIdx;
    parts.push(remaining.slice(0, breakAt));
    remaining = ' ' + remaining.slice(breakAt).trimStart();
    first = false;
  }
  parts.push(remaining);
  return parts.join(CRLF);
}

function encodeHeaderValue(value: string) {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  const encoded = Array.from(new TextEncoder().encode(value))
    .map((b) => {
      if ((b >= 0x30 && b <= 0x39) || (b >= 0x41 && b <= 0x5a) || (b >= 0x61 && b <= 0x7a)) {
        return String.fromCharCode(b);
      }
      return '=' + b.toString(16).toUpperCase().padStart(2, '0');
    })
    .join('');
  return `=?UTF-8?Q?${encoded}?=`;
}

function formatDate(date: Date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = days[date.getUTCDay()];
  const dd = date.getUTCDate();
  const m = months[date.getUTCMonth()];
  const y = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${d}, ${dd} ${m} ${y} ${hh}:${mm}:${ss} +0000`;
}

function base64EncodeRaw(data: ArrayBuffer | Uint8Array) {
  const bytes = new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}