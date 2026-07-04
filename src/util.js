// Small browser helpers shared across the S/MIME plugin modules.
// (The native app pulled these from @/lib/utils; the sandbox has no host
// imports, so we provide local, dependency-free equivalents.)

/** RFC 4122 v4 UUID using the same crypto.randomUUID the host relies on. */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return (
    hex.slice(0, 4).join('') +
    '-' +
    hex.slice(4, 6).join('') +
    '-' +
    hex.slice(6, 8).join('') +
    '-' +
    hex.slice(8, 10).join('') +
    '-' +
    hex.slice(10, 16).join('')
  );
}

/** Lower-case hex string for any byte source (replaces Node's Buffer.toString('hex')). */
export function toHex(source) {
  let bytes;
  if (source instanceof ArrayBuffer) {
    bytes = new Uint8Array(source);
  } else if (ArrayBuffer.isView(source)) {
    bytes = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  } else {
    bytes = new Uint8Array(source);
  }
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

/** Constant-ish byte-array equality. */
export function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Copy any ArrayBuffer-ish slice into a standalone ArrayBuffer. */
export function toArrayBuffer(view) {
  if (view instanceof ArrayBuffer) return view;
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
}
