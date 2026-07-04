/**
 * Minimal, deterministic MIME builder for outgoing S/MIME messages.
 * Ported from lib/smime/mime-builder.ts. All line endings are CRLF.
 */

import { generateUUID } from './util.js';

const CRLF = '\r\n';

/** Build a complete MIME message and return it as a Uint8Array (UTF-8). */
export function buildMimeMessage(input) {
  const boundary = generateBoundary();
  const lines = [];

  lines.push(formatHeader('From', formatAddress(input.from)));
  lines.push(formatHeader('To', input.to.map(formatAddress).join(', ')));
  if (input.cc?.length) lines.push(formatHeader('Cc', input.cc.map(formatAddress).join(', ')));
  lines.push(formatHeader('Subject', encodeHeaderValue(input.subject)));
  lines.push(formatHeader('Date', formatDate(input.date ?? new Date())));
  lines.push(formatHeader('Message-ID', input.messageId ?? `<${generateUUID()}@smime.local>`));
  if (input.inReplyTo) lines.push(formatHeader('In-Reply-To', input.inReplyTo));
  if (input.references?.length) lines.push(formatHeader('References', input.references.join(' ')));
  lines.push('MIME-Version: 1.0');

  const hasText = !!input.textBody;
  const hasHtml = !!input.htmlBody;
  const hasAttachments = !!input.attachments?.length;

  if (!hasAttachments && hasText && !hasHtml) {
    lines.push('Content-Type: text/plain; charset=utf-8');
    lines.push('Content-Transfer-Encoding: quoted-printable');
    lines.push('');
    lines.push(quotedPrintableEncode(input.textBody));
  } else if (!hasAttachments && hasText && hasHtml) {
    const altBoundary = generateBoundary();
    lines.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`);
    lines.push('');
    lines.push(`--${altBoundary}`);
    lines.push('Content-Type: text/plain; charset=utf-8');
    lines.push('Content-Transfer-Encoding: quoted-printable');
    lines.push('');
    lines.push(quotedPrintableEncode(input.textBody));
    lines.push(`--${altBoundary}`);
    lines.push('Content-Type: text/html; charset=utf-8');
    lines.push('Content-Transfer-Encoding: quoted-printable');
    lines.push('');
    lines.push(quotedPrintableEncode(input.htmlBody));
    lines.push(`--${altBoundary}--`);
  } else if (!hasAttachments && !hasText && hasHtml) {
    lines.push('Content-Type: text/html; charset=utf-8');
    lines.push('Content-Transfer-Encoding: quoted-printable');
    lines.push('');
    lines.push(quotedPrintableEncode(input.htmlBody));
  } else if (hasAttachments) {
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push('');

    if (hasText && hasHtml) {
      const altBoundary = generateBoundary();
      lines.push(`--${boundary}`);
      lines.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`);
      lines.push('');
      lines.push(`--${altBoundary}`);
      lines.push('Content-Type: text/plain; charset=utf-8');
      lines.push('Content-Transfer-Encoding: quoted-printable');
      lines.push('');
      lines.push(quotedPrintableEncode(input.textBody));
      lines.push(`--${altBoundary}`);
      lines.push('Content-Type: text/html; charset=utf-8');
      lines.push('Content-Transfer-Encoding: quoted-printable');
      lines.push('');
      lines.push(quotedPrintableEncode(input.htmlBody));
      lines.push(`--${altBoundary}--`);
    } else if (hasText) {
      lines.push(`--${boundary}`);
      lines.push('Content-Type: text/plain; charset=utf-8');
      lines.push('Content-Transfer-Encoding: quoted-printable');
      lines.push('');
      lines.push(quotedPrintableEncode(input.textBody));
    } else if (hasHtml) {
      lines.push(`--${boundary}`);
      lines.push('Content-Type: text/html; charset=utf-8');
      lines.push('Content-Transfer-Encoding: quoted-printable');
      lines.push('');
      lines.push(quotedPrintableEncode(input.htmlBody));
    }

    for (const att of input.attachments) {
      lines.push(`--${boundary}`);
      const disposition = att.cid ? 'inline' : 'attachment';
      lines.push(`Content-Type: ${att.contentType}; name="${encodeHeaderValue(att.filename)}"`);
      lines.push(`Content-Disposition: ${disposition}; filename="${encodeHeaderValue(att.filename)}"`);
      lines.push('Content-Transfer-Encoding: base64');
      if (att.cid) lines.push(`Content-ID: <${att.cid}>`);
      lines.push('');
      lines.push(base64Encode(att.content));
    }
    lines.push(`--${boundary}--`);
  } else {
    lines.push('Content-Type: text/plain; charset=utf-8');
    lines.push('');
  }

  return new TextEncoder().encode(lines.join(CRLF));
}

// ── Helpers ──────────────────────────────────────────────────────────

function generateBoundary() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `----=_Part_${hex}`;
}

function formatAddress(addr) {
  if (addr.name) {
    const escaped = addr.name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}" <${addr.email}>`;
  }
  return addr.email;
}

function formatHeader(name, value) {
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

function encodeHeaderValue(value) {
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

function formatDate(date) {
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

/**
 * Wrap a CMS binary blob in a proper RFC 5322 / S/MIME message.
 * Returns a Blob of type message/rfc822.
 */
export function wrapCmsAsSmimeMessage(cmsBlob, input) {
  const lines = [];

  lines.push(formatHeader('From', formatAddress(input.from)));
  lines.push(formatHeader('To', input.to.map(formatAddress).join(', ')));
  if (input.cc?.length) lines.push(formatHeader('Cc', input.cc.map(formatAddress).join(', ')));
  lines.push(formatHeader('Subject', encodeHeaderValue(input.subject)));
  lines.push(formatHeader('Date', formatDate(input.date ?? new Date())));
  lines.push(formatHeader('Message-ID', input.messageId ?? `<${generateUUID()}@smime.local>`));
  if (input.inReplyTo) lines.push(formatHeader('In-Reply-To', input.inReplyTo));
  if (input.references?.length) lines.push(formatHeader('References', input.references.join(' ')));
  lines.push('MIME-Version: 1.0');
  lines.push(`Content-Type: application/pkcs7-mime; smime-type=${input.smimeType}; name="smime.p7m"`);
  lines.push('Content-Transfer-Encoding: base64');
  lines.push('Content-Disposition: attachment; filename="smime.p7m"');
  lines.push('');

  const headerBytes = new TextEncoder().encode(lines.join(CRLF));
  return new Blob([headerBytes, cmsToBase64Blob(cmsBlob)], { type: 'message/rfc822' });
}

function cmsToBase64Blob(data) {
  let bytes;
  if (data instanceof Uint8Array) bytes = data;
  else if (data instanceof ArrayBuffer) bytes = new Uint8Array(data);
  else bytes = new Uint8Array(0);
  const b64 = base64Encode(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  return new Blob([new TextEncoder().encode(b64 + CRLF)]);
}

/** Encode string as quoted-printable (RFC 2045). */
export function quotedPrintableEncode(input) {
  const bytes = new TextEncoder().encode(input);
  const lines = [];
  let line = '';

  for (const b of bytes) {
    let encoded;
    if (b === 0x0d || b === 0x0a) {
      encoded = String.fromCharCode(b);
    } else if (b === 0x09 || (b >= 0x20 && b <= 0x7e && b !== 0x3d)) {
      encoded = String.fromCharCode(b);
    } else {
      encoded = '=' + b.toString(16).toUpperCase().padStart(2, '0');
    }

    if (b === 0x0a) {
      if (line.endsWith('\r')) line = line.slice(0, -1);
      lines.push(line);
      line = '';
      continue;
    }

    if (line.length + encoded.length > 75) {
      lines.push(line + '=');
      line = encoded;
    } else {
      line += encoded;
    }
  }
  lines.push(line);
  return lines.join(CRLF);
}

/** Encode ArrayBuffer as base64 with line breaks at 76 chars. */
export function base64Encode(data) {
  const bytes = new Uint8Array(data);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary);
  const lines = [];
  for (let i = 0; i < b64.length; i += 76) lines.push(b64.slice(i, i + 76));
  return lines.join(CRLF);
}
