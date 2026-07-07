/**
 * Minimal RFC 5322 / MIME parser adapted for OpenPGP.
 * Handles the inner structure recovered after decryption/verification, 
 * extracts rich bodies, handles standalone PGP text blocks, and isolates PGP signatures.
 */

const decoder = new TextDecoder('utf-8', { fatal: false });

export interface Attachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface ParseMimeResult {
  html: string;
  text: string;
  attachments: Attachment[];
  pgpSignatureBlock: string | null;
}

interface MimeNode {
  type: string;
  params: Record<string, string>;
  cte: string;
  disposition: string;
  headers: Record<string, string>;
  body: string;
  children: MimeNode[];
}

interface OutputCollector {
  html: string;
  text: string;
  attachments: Attachment[];
  pgpSignatureBlock: string | null;
}

/** * Parse raw inner MIME bytes into { html, text, attachments, pgpSignatureBlock }.
 * Adds support for PGP Inline parsing and signatures isolation.
 */
export function parseMime(bytes: Uint8Array): ParseMimeResult {
  const text = binaryString(bytes);
  
  // ── Specific PGP Inline Case ──────────────────────────────────────
  // If the raw payload received directly contains a PGP encrypted or signed text block
  if (text.includes('-----BEGIN PGP MESSAGE-----') || text.includes('-----BEGIN PGP SIGNED MESSAGE-----')) {
    return parsePgpInline(text);
  }

  const node = parseEntity(text);
  const out: OutputCollector = { html: '', text: '', attachments: [], pgpSignatureBlock: null };
  collect(node, out);
  
  // Cleanup: If an attachment is the detached PGP signature (PGP/MIME),
  // we extract it from the list to put it in a dedicated field in the application.
  const sigIndex = out.attachments.findIndex(att => 
    att.type === 'application/pgp-signature' || att.name === 'signature.asc'
  );
  if (sigIndex !== -1) {
    const sigAttachment = out.attachments[sigIndex];
    // Reconverts the Data URL to text string for the openpgp.verify() API
    out.pgpSignatureBlock = dataUrlToText(sigAttachment.dataUrl);
    out.attachments.splice(sigIndex, 1); // Removes from displayed attachments
  }

  // Fallback for non-MIME inner content
  if (!out.html && !out.text) {
    const raw = decoder.decode(bytes).trim();
    if (raw) out.text = raw;
  }
  return out;
}

/** Handles a plain text block containing PGP without complex MIME structure */
function parsePgpInline(rawText: string): ParseMimeResult {
  // Removes residual HTTP/SMTP transport header noise if present
  const cleanText = rawText.trim();
  return {
    html: '',
    text: cleanText, // Le moteur crypto-engine l'interceptera pour affichage/traitement
    attachments: [],
    pgpSignatureBlock: cleanText.includes('-----BEGIN PGP SIGNED MESSAGE-----') ? cleanText : null
  };
}

// Treat bytes as latin1 so byte boundaries survive; decode per-part by charset.
function binaryString(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function parseEntity(raw: string): MimeNode {
  const sepMatch = raw.match(/\r?\n\r?\n/);
  const headerText = sepMatch ? raw.slice(0, sepMatch.index) : raw;
  const body = (sepMatch && sepMatch.index) ? raw.slice(sepMatch.index + (sepMatch[0]?.length ?? 0)) : '';

  const headers = parseHeaders(headerText);
  const ctRaw = headers['content-type'] || 'text/plain';
  const { type, params } = parseContentType(ctRaw);
  const cte = (headers['content-transfer-encoding'] || '7bit').trim().toLowerCase();
  const disposition = (headers['content-disposition'] || '').toLowerCase();

  const node: MimeNode = { type, params, cte, disposition, headers, body, children: [] };

  if (type.startsWith('multipart/') && params.boundary) {
    node.children = splitMultipart(body, params.boundary).map(parseEntity);
  }
  return node;
}

function parseHeaders(headerText: string): Record<string, string> {
  const unfolded = headerText.replace(/\r?\n[ \t]+/g, ' ');
  const headers: Record<string, string> = {};
  for (const line of unfolded.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const name = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    headers[name] = headers[name] ? `${headers[name]}, ${value}` : value;
  }
  return headers;
}

function parseContentType(value: string): { type: string; params: Record<string, string> } {
  const parts = value.split(';');
  const type = parts[0]?.trim().toLowerCase() || 'text/plain';
  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim().toLowerCase();
    let v = part.slice(eq + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    params[k] = v;
  }
  return { type, params };
}

function splitMultipart(body: string, boundary: string): string[] {
  const delim = `--${boundary}`;
  const parts: string[] = [];
  const segments = body.split(delim);
  for (let i = 1; i < segments.length; i++) {
    let seg = segments[i];
    if (!seg) continue;
    if (seg.startsWith('--')) break; // closing delimiter
    seg = seg.replace(/^\r?\n/, '').replace(/\r?\n$/, '');
    parts.push(seg);
  }
  return parts;
}

function decodeBody(node: MimeNode): Uint8Array {
  const { cte, body } = node;
  if (cte === 'base64') {
    const cleaned = body.replace(/[^A-Za-z0-9+/=]/g, '');
    try {
      const bin = atob(cleaned);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    } catch {
      return new Uint8Array(0);
    }
  }
  if (cte === 'quoted-printable') {
    return qpDecode(body);
  }
  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i++) bytes[i] = body.charCodeAt(i) & 0xff;
  return bytes;
}

function qpDecode(input: string): Uint8Array {
  const out: number[] = [];
  const cleaned = input.replace(/=\r?\n/g, '');
  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned[i];
    if (c === '=' && i + 2 < cleaned.length) {
      const hex = cleaned.substring(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        out.push(parseInt(hex, 16));
        i += 2;
        continue;
      }
    }
    if (c) out.push(c.charCodeAt(0) & 0xff);
  }
  return new Uint8Array(out);
}

function decodeText(node: MimeNode): string {
  const bytes = decodeBody(node);
  const charset = (node.params.charset || 'utf-8').toLowerCase();
  try {
    return new TextDecoder(charset, { fatal: false }).decode(bytes);
  } catch {
    return decoder.decode(bytes);
  }
}

function filenameFor(node: MimeNode): string {
  const cd = node.headers['content-disposition'] || '';
  const m = cd.match(/filename\*?=(?:"([^"]+)"|([^;]+))/i);
  if (m) return (m[1] || m[2] || '').trim();
  if (node.params.name) return node.params.name;
  return 'attachment';
}

function collect(node: MimeNode, out: OutputCollector): void {
  const { type, disposition } = node;
  const isAttachment = disposition.includes('attachment') ||
    (!type.startsWith('text/') && !type.startsWith('multipart/'));

  if (type.startsWith('multipart/')) {
    for (const child of node.children) collect(child, out);
    return;
  }

  if (type === 'text/html' && !isAttachment) {
    out.html = decodeText(node);
    return;
  }
  if (type === 'text/plain' && !isAttachment) {
    out.text = decodeText(node);
    return;
  }

  const bytes = decodeBody(node);
  out.attachments.push({
    name: filenameFor(node),
    type: type || 'application/octet-stream',
    size: bytes.length,
    dataUrl: bytesToDataUrl(bytes, type || 'application/octet-stream'),
  });
}

function bytesToDataUrl(bytes: Uint8Array, type: string): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${type};base64,${btoa(binary)}`;
}

/** Helper to decode the signature Data URL to plain text for OpenPGP */
function dataUrlToText(dataUrl: string): string | null {
  try {
    const base64Str = dataUrl.split(',')[1];
    return base64Str ? atob(base64Str) : null;
  } catch {
    return null;
  }
}