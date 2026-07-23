import * as openpgp from 'openpgp';
import { listKeyRecords } from './storage.ts';
import { fetchKeyFromBackground } from './pgp/session-broadcast.ts';
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

export function bytesArrayBuffer(u8: Uint8Array) {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

export function bufferToBytes(buffer: ArrayBuffer): number[] {
  return Array.from(new Uint8Array(buffer));
}

export function bytesToBuffer(bytes: number[]): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array | undefined): string | undefined {
  if (!buffer) return undefined;
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string | undefined): ArrayBuffer | undefined {
  if (!base64) return undefined;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}


//──────────── Key Resolution────────────────────────────────────


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

export function generateSalt() : ArrayBuffer{
  return crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer;
}

export interface ContactCard {
  id: string;
  originalId?: string;
  uid?: string;
  addressBookIds: Record<string, boolean>;
  kind?: 'individual' | 'group' | 'org' | 'location' | 'device' | 'application';
  accountId?: string;
  accountName?: string;
  isShared?: boolean;
  // Local account-store ID - set when the Pro shell aggregates contacts
  // from multiple connected accounts. See `Calendar.localAccountId`.
  localAccountId?: string;
  language?: string;
  name?: ContactName;
  nicknames?: Record<string, ContactNickname>;
  emails?: Record<string, ContactEmail>;
  phones?: Record<string, ContactPhone>;
  onlineServices?: Record<string, ContactOnlineService>;
  preferredLanguages?: Record<string, ContactLanguagePref>;
  organizations?: Record<string, ContactOrganization>;
  titles?: Record<string, ContactTitle>;
  addresses?: Record<string, ContactAddress>;
  notes?: Record<string, ContactNote>;
  media?: Record<string, ContactMedia>;
  cryptoKeys?: Record<string, ContactCryptoKey>;
  keywords?: Record<string, boolean>;
  members?: Record<string, boolean>;
  speakToAs?: {
    grammaticalGender?: string;
    pronouns?: Record<string, { pronouns: string; pref?: number; contexts?: Record<string, boolean> }>;
  };
  calendarUri?: string;
  schedulingUri?: string;
  freeBusyUri?: string;
  source?: string;
  prodId?: string;
  created?: string;
  updated?: string;
}


export interface ContactName {
  components?: NameComponent[];
  isOrdered?: boolean;
  full?: string;
  defaultSeparator?: string;
}

export interface NameComponent {
  kind: 'given' | 'surname' | 'prefix' | 'suffix' | 'additional' | 'separator' | 'credential' | 'title' | 'middle' | 'given2' | 'surname2' | 'generation';
  value: string;
}

export interface ContactEmail {
  address: string;
  contexts?: Record<string, boolean>;
  label?: string;
  pref?: number;
}

export interface ContactPhone {
  number: string;
  contexts?: Record<string, boolean>;
  features?: Record<string, boolean>;
  label?: string;
  pref?: number;
}

export interface ContactCryptoKey {
  uri: string;
  mediaType?: string;
  contexts?: Record<string, boolean>;
}

export interface ContactOnlineService {
  service?: string;
  uri: string;
  user?: string;
  contexts?: Record<string, boolean>;
  label?: string;
  pref?: number;
}

export interface ContactLanguagePref {
  language: string;
  contexts?: Record<string, boolean>;
  pref?: number;
}

export interface ContactOrganization {
  name?: string;
  units?: Array<{ name: string }>;
  sortAs?: string;
}

export interface ContactTitle {
  name: string;
  kind?: 'title' | 'role';
  organizationId?: string;
}

// RFC 9553 AddressComponent
export interface AddressComponent {
  kind: 'room' | 'apartment' | 'floor' | 'building' | 'number' | 'name' | 'block' | 'subDistrict' | 'district' | 'locality' | 'region' | 'postcode' | 'country' | 'direction' | 'landmark' | 'postOfficeBox' | 'separator' | string;
  value: string;
  phonetic?: string;
}

export interface ContactAddress {
  // RFC 9553 format
  components?: AddressComponent[];
  full?: string;
  isOrdered?: boolean;
  defaultSeparator?: string;
  // Legacy flat fields (from vCard import)
  street?: string;
  locality?: string;
  region?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  fullAddress?: string;
  coordinates?: string;
  timeZone?: string;
  contexts?: Record<string, boolean>;
  label?: string;
  pref?: number;
}

export interface ContactNickname {
  name: string;
  contexts?: Record<string, boolean>;
}

export interface ContactNote {
  note: string;
  created?: string;
  author?: { name?: string; uri?: string };
}

export interface ContactMedia {
  kind: 'photo' | 'sound' | 'logo';
  uri: string;
  mediaType?: string;
}

// RFC 9553 PartialDate
export interface PartialDate {
  '@type'?: 'PartialDate';
  year?: number;
  month?: number;
  day?: number;
  calendarScale?: string;
}

// RFC 9553 Timestamp
export interface Timestamp {
  '@type': 'Timestamp';
  utc: string;
}