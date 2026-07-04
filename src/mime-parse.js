/**
 * Minimal RFC 5322 / MIME parser used only for the inner content recovered
 * after decryption / signature-stripping. We need just enough to pull out the
 * best-alternative text/html body and any leaf attachments; the host
 * re-sanitizes returned HTML, so this never has to be a hardened renderer.
 */

const decoder = new TextDecoder('utf-8', { fatal: false });

/** Parse raw inner MIME bytes into { html, text, attachments }. */
export function parseMime(bytes) {
  const text = binaryString(bytes);
  const node = parseEntity(text);
  const out = { html: '', text: '', attachments: [] };
  collect(node, out);
  // Fallback for non-MIME inner content (e.g. messages signed/encrypted by
  // OpenSSL or older clients where the protected payload is raw text with no
  // Content-Type). If structured parsing produced no renderable body, surface
  // the decoded bytes as plain text so the message is never shown blank.
  if (!out.html && !out.text) {
    const raw = decoder.decode(bytes).trim();
    if (raw) out.text = raw;
  }
  return out;
}

// Treat bytes as latin1 so byte boundaries survive; decode per-part by charset.
function binaryString(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function parseEntity(raw) {
  const sepMatch = raw.match(/\r?\n\r?\n/);
  const headerText = sepMatch ? raw.slice(0, sepMatch.index) : raw;
  const body = sepMatch ? raw.slice(sepMatch.index + sepMatch[0].length) : '';

  const headers = parseHeaders(headerText);
  const ctRaw = headers['content-type'] || 'text/plain';
  const { type, params } = parseContentType(ctRaw);
  const cte = (headers['content-transfer-encoding'] || '7bit').trim().toLowerCase();
  const disposition = (headers['content-disposition'] || '').toLowerCase();

  const node = { type, params, cte, disposition, headers, body, children: [] };

  if (type.startsWith('multipart/') && params.boundary) {
    node.children = splitMultipart(body, params.boundary).map(parseEntity);
  }
  return node;
}

function parseHeaders(headerText) {
  const unfolded = headerText.replace(/\r?\n[ \t]+/g, ' ');
  const headers = {};
  for (const line of unfolded.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const name = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    headers[name] = headers[name] ? `${headers[name]}, ${value}` : value;
  }
  return headers;
}

function parseContentType(value) {
  const parts = value.split(';');
  const type = parts[0].trim().toLowerCase();
  const params = {};
  for (let i = 1; i < parts.length; i++) {
    const eq = parts[i].indexOf('=');
    if (eq < 0) continue;
    const k = parts[i].slice(0, eq).trim().toLowerCase();
    let v = parts[i].slice(eq + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    params[k] = v;
  }
  return { type, params };
}

function splitMultipart(body, boundary) {
  const delim = `--${boundary}`;
  const parts = [];
  const segments = body.split(delim);
  for (let i = 1; i < segments.length; i++) {
    let seg = segments[i];
    if (seg.startsWith('--')) break; // closing delimiter
    seg = seg.replace(/^\r?\n/, '').replace(/\r?\n$/, '');
    parts.push(seg);
  }
  return parts;
}

function decodeBody(node) {
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
  // 7bit / 8bit / binary — body is a latin1 binary string
  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i++) bytes[i] = body.charCodeAt(i) & 0xff;
  return bytes;
}

function qpDecode(input) {
  const out = [];
  const cleaned = input.replace(/=\r?\n/g, ''); // soft line breaks
  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned[i];
    if (c === '=' && i + 2 < cleaned.length) {
      const hex = cleaned.substr(i + 1, 2);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        out.push(parseInt(hex, 16));
        i += 2;
        continue;
      }
    }
    out.push(cleaned.charCodeAt(i) & 0xff);
  }
  return new Uint8Array(out);
}

function decodeText(node) {
  const bytes = decodeBody(node);
  const charset = (node.params.charset || 'utf-8').toLowerCase();
  try {
    return new TextDecoder(charset, { fatal: false }).decode(bytes);
  } catch {
    return decoder.decode(bytes);
  }
}

function filenameFor(node) {
  const cd = node.headers['content-disposition'] || '';
  const m = cd.match(/filename\*?=(?:"([^"]+)"|([^;]+))/i);
  if (m) return (m[1] || m[2] || '').trim();
  if (node.params.name) return node.params.name;
  return 'attachment';
}

function collect(node, out) {
  const { type, disposition } = node;
  const isAttachment = disposition.includes('attachment') ||
    (!type.startsWith('text/') && !type.startsWith('multipart/'));

  if (type.startsWith('multipart/')) {
    if (type === 'multipart/alternative') {
      // Prefer the richest alternative; collect text+html, last wins per type.
      for (const child of node.children) collect(child, out);
    } else {
      for (const child of node.children) collect(child, out);
    }
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

  // Leaf attachment
  const bytes = decodeBody(node);
  out.attachments.push({
    name: filenameFor(node),
    type: type || 'application/octet-stream',
    size: bytes.length,
    dataUrl: bytesToDataUrl(bytes, type || 'application/octet-stream'),
  });
}

function bytesToDataUrl(bytes, type) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${type};base64,${btoa(binary)}`;
}
