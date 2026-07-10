import * as openpgp from 'openpgp';
import host from '@plugin-host';
import { getSessionKeys, KeyRecord, listKeyRecords, listPublicCerts } from './storage.ts';
import { fetchKeyFromBackground, getBackgroundSessionKey } from './pgp/session-broadcast.ts';
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
export function toHex(source: ArrayBuffer | ArrayBufferView): string {
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


export async function clearArmoredPrivateKeyToPrivateKey(armoredKey: string): Promise<openpgp.PrivateKey> {
 return  await openpgp.readKey({ 
        armoredKey: armoredKey 
      }) as openpgp.PrivateKey;
}

export function parseAddr(value: any) {
  if (value && typeof value === 'object' && value.email) {
    return { name: value.name || undefined, email: String(value.email) };
  }
  const s = String(value || '');
  const m = s.match(/^\s*(?:"?([^"<]*?)"?\s*)?<?\s*([^<>\s]+@[^<>\s]+)\s*>?\s*$/);
  if (m) return { name: (m[1] || '').trim() || undefined, email: m[2] };
  return { email: s.trim() };
}
export function addrList(arr: any) {
  if (!arr) return [];
  return (Array.isArray(arr) ? arr : [arr]).map(parseAddr).filter((a) => a.email);
}
export function emailsOf(input: any): string[] {
  // 1. Normalize the input as an array and filter out empty values
  const items = Array.isArray(input) ? input : [input];

  return items
    .map((item) => {
      // 2. If it is an object (e.g. { email: '...' })
      if (item && typeof item === 'object' && item.email) {
        return String(item.email);
      }
      
      // 3. If it is a string, extract what is between < > or use the raw string
      const str = String(item || '').trim();
      const match = str.match(/<([^>]+)>/);
      
      return match ? match[1] : str;
    })
    // 4. Clean the result, lowercase it, and filter invalid/empty emails
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email && email.includes('@'));
}

// ─── Blob/bytes helpers ────────────────────────────────────────────────

export async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}
export function bytesArrayBuffer(u8: Uint8Array) {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}


export async function fetchBlobAsDataUrl(blobId: string, options?: { name?: string; type?: string }): Promise<string> {
  // 1. Récupérer le Uint8Array
  const bytes = await host.jmap.fetchBlob(blobId, options);


  
  // 2. Spécifier le type MIME (par défaut application/octet-stream si non fourni)
  const mimeType = options?.type || 'application/octet-stream';

  // 3. Convertir en Data URL à l'aide de l'API FileReader
  return new Promise((resolve, reject) => {
    const blob = new Blob([bytes as BlobPart], { type: mimeType });
    const reader = new FileReader();
    
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    
    reader.readAsDataURL(blob);
  });
}

export function extractEmailContent(bodyStructure: any, bodyValues: any): { plainText: string | null, htmlText: string | null } {
    let plainText = null;
    let htmlText = null;

    // Direct check if subParts exists and is an array
    if (bodyStructure && Array.isArray(bodyStructure.subParts)) {
        for (const part of bodyStructure.subParts) {
            if (part.type === "text/plain" && bodyValues[part.partId]) {
                plainText = bodyValues[part.partId].value;
            } else if (part.type === "text/html" && bodyValues[part.partId]) {
                htmlText = bodyValues[part.partId].value;
            }else if(part.type === "multipart/alternative"){
                for (const subpart of part.subParts) {
                  if (subpart.type === "text/plain" && bodyValues[subpart.partId]) {
                      plainText = bodyValues[subpart.partId].value;
                  } else if (subpart.type === "text/html" && bodyValues[subpart.partId]) {
                      htmlText = bodyValues[subpart.partId].value;
                  }
              }
            }
        }
    }

    return { plainText, htmlText };
}

// -------- Key Resolution--------

export async function signingKeyRecordForEmail(fromEmail: string | undefined): Promise<KeyRecord | undefined> {
  const recs = await listKeyRecords();
  const lower = (fromEmail || '').toLowerCase();
  return (
    recs.find((r) => r.email === lower && r.capabilities?.canSign !== false) ||
    recs.find((r) => r.email === lower) ||
    undefined
  );
}

export async function recipientKeysFor(emails:any) {
  const certs = await listPublicCerts();
  const found = [];
  const missing = [];
  for (const email of emails) {
    const c = certs.find((pc) => pc.email.toLowerCase() === email.toLowerCase());
    if (c) found.push(c.publicKey); // Utilise .publicKey au lieu de .certificate
    else missing.push(email);
  }
  return { found, missing };
}

// Build the map of unlocked private keys from the session store.
export async function unlockedDecryptMaps() {
  const recs = await listKeyRecords();
  const unlockedKeys = new Map();
  for (const r of recs) {
    const s = await fetchKeyFromBackground(r.id);
    if (!s) continue;
    // OpenPGP unifies the decryption key (no legacy key needed anymore)
    if (s.unlockedPrivateKey) unlockedKeys.set(r.id, s.unlockedPrivateKey);
  }
  return { keyRecords: recs, unlockedKeys };
}