/**
 * Decrypt CMS EnvelopedData to recover the inner MIME content.
 * Supports issuerAndSerialNumber and subjectKeyIdentifier recipient IDs.
 * Ported from lib/smime/smime-decrypt.ts (Buffer → toHex).
 */

import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';
import { getLinerCryptoEngine, withLinerEngine } from './crypto-engine.js';
import { arraysEqual, toHex } from './util.js';

export class SmimeKeyLockedError extends Error {
  constructor(message, keyRecordId) {
    super(message);
    this.name = 'SmimeKeyLockedError';
    this.keyRecordId = keyRecordId;
  }
}

/**
 * Attempt to decrypt CMS EnvelopedData.
 * @param input { cmsBytes, keyRecords, unlockedKeys: Map, legacyUnlockedKeys?: Map }
 * @returns { mimeBytes: Uint8Array, keyRecordId: string }
 */
export async function smimeDecrypt(input) {
  const { cmsBytes, keyRecords, unlockedKeys, legacyUnlockedKeys } = input;

  const contentInfo = parseContentInfo(cmsBytes);
  const envelopedData = extractEnvelopedData(contentInfo);

  const matchedRecords = findMatchingKeyRecords(envelopedData, keyRecords);
  if (matchedRecords.length === 0) {
    throw new Error('No imported S/MIME key matches any recipient in this encrypted message');
  }

  for (const { keyRecord, recipientIndex } of matchedRecords) {
    const privateKey = unlockedKeys.get(keyRecord.id);
    if (!privateKey) {
      const legacyKey = legacyUnlockedKeys?.get(keyRecord.id);
      if (legacyKey) {
        try {
          const decrypted = await decryptWithKey(envelopedData, recipientIndex, legacyKey, keyRecord);
          return { mimeBytes: new Uint8Array(decrypted), keyRecordId: keyRecord.id };
        } catch {
          continue;
        }
      }
      continue;
    }

    try {
      const decrypted = await decryptWithKey(envelopedData, recipientIndex, privateKey, keyRecord);
      return { mimeBytes: new Uint8Array(decrypted), keyRecordId: keyRecord.id };
    } catch {
      const legacyKey = legacyUnlockedKeys?.get(keyRecord.id);
      if (legacyKey) {
        try {
          const decrypted = await decryptWithKey(envelopedData, recipientIndex, legacyKey, keyRecord);
          return { mimeBytes: new Uint8Array(decrypted), keyRecordId: keyRecord.id };
        } catch {
          /* try next record */
        }
      }
      continue;
    }
  }

  const isUnlocked = (id) => unlockedKeys.has(id) || (legacyUnlockedKeys?.has(id) ?? false);
  const hasLockedMatch = matchedRecords.some((m) => !isUnlocked(m.keyRecord.id));
  if (hasLockedMatch) {
    const lockedRecord = matchedRecords.find((m) => !isUnlocked(m.keyRecord.id));
    throw new SmimeKeyLockedError(
      'S/MIME key is locked. Unlock it to decrypt this message.',
      lockedRecord.keyRecord.id,
    );
  }

  throw new Error('Failed to decrypt message with any available key');
}

/** Key record IDs that could potentially decrypt a message (to prompt unlock). */
export function findDecryptionCandidates(cmsBytes, keyRecords) {
  try {
    const contentInfo = parseContentInfo(cmsBytes);
    const envelopedData = extractEnvelopedData(contentInfo);
    return findMatchingKeyRecords(envelopedData, keyRecords).map((m) => m.keyRecord.id);
  } catch {
    return [];
  }
}

/**
 * Normalize raw blob bytes into DER-encoded CMS data.
 * JMAP may return raw DER, base64 DER, a full MIME part, or PEM.
 */
export function normalizeCmsBytes(raw) {
  if (raw.byteLength === 0) return raw;

  const bytes = new Uint8Array(raw);
  if (bytes[0] === 0x30) return raw; // already DER

  let text = new TextDecoder().decode(raw);

  const looksMostlyText = (() => {
    const sample = text.slice(0, Math.min(text.length, 2048));
    if (sample.length === 0) return false;
    let printable = 0;
    for (let i = 0; i < sample.length; i++) {
      const code = sample.charCodeAt(i);
      if (code === 0x09 || code === 0x0a || code === 0x0d || (code >= 0x20 && code <= 0x7e)) printable++;
    }
    return printable / sample.length > 0.85;
  })();

  const headerEndMatch = text.match(/\r?\n\r?\n/);
  const hasMimeHeaderHints = /content-type:|content-transfer-encoding:|mime-version:/i.test(
    text.slice(0, Math.min(text.length, 8192)),
  );
  if (looksMostlyText && headerEndMatch && headerEndMatch.index !== undefined && hasMimeHeaderHints) {
    text = text.substring(headerEndMatch.index + headerEndMatch[0].length);
  }

  text = text
    .replace(/-----BEGIN [A-Z0-9 ]+-----/g, '')
    .replace(/-----END [A-Z0-9 ]+-----/g, '')
    .replace(/\s/g, '');

  if (text.length === 0) return raw;

  try {
    const binary = atob(text);
    const decoded = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) decoded[i] = binary.charCodeAt(i);
    if (decoded.length > 0 && decoded[0] === 0x30) return decoded.buffer;
  } catch { /* not DER, continue */ }

  if (looksMostlyText) {
    const originalText = new TextDecoder().decode(raw);
    const sectionRegex = /content-transfer-encoding:\s*base64[\s\S]*?\r?\n\r?\n([\s\S]*?)(?:\r?\n--[^\r\n]+|$)/ig;
    const sectionBlocks = [];
    let sectionMatch;
    while ((sectionMatch = sectionRegex.exec(originalText)) !== null) sectionBlocks.push(sectionMatch[1]);

    for (const block of sectionBlocks) {
      const cleaned = block.replace(/\s/g, '');
      if (cleaned.length < 8 || !/^[A-Za-z0-9+/=]+$/.test(cleaned)) continue;
      try {
        const binary = atob(cleaned);
        const decoded = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) decoded[i] = binary.charCodeAt(i);
        if (decoded.length > 0 && decoded[0] === 0x30) return decoded.buffer;
      } catch { /* next section */ }
    }

    const base64Blocks = originalText.match(/[A-Za-z0-9+/=\r\n]{128,}/g) || [];
    const cleaned = base64Blocks
      .map((block) => block.replace(/\s/g, ''))
      .filter((block) => block.length >= 128 && /^[A-Za-z0-9+/=]+$/.test(block));
    cleaned.sort((a, b) => b.length - a.length);

    for (const block of cleaned) {
      try {
        const binary = atob(block);
        const decoded = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) decoded[i] = binary.charCodeAt(i);
        if (decoded.length > 0 && decoded[0] === 0x30) return decoded.buffer;
      } catch { /* next block */ }
    }
  }

  return raw;
}

function parseContentInfo(der) {
  const asn1 = asn1js.fromBER(der);
  if (asn1.offset === -1) throw new Error('Invalid ASN.1 data - cannot parse CMS envelope');
  try {
    return new pkijs.ContentInfo({ schema: asn1.result });
  } catch {
    throw new Error('Invalid ASN.1 data - cannot parse CMS envelope');
  }
}

function extractEnvelopedData(contentInfo) {
  if (contentInfo.contentType !== '1.2.840.113549.1.7.3') {
    throw new Error(`Unexpected CMS content type: ${contentInfo.contentType}`);
  }
  return new pkijs.EnvelopedData({ schema: contentInfo.content });
}

function findMatchingKeyRecords(envelopedData, keyRecords) {
  const matches = [];

  for (let i = 0; i < envelopedData.recipientInfos.length; i++) {
    const ri = envelopedData.recipientInfos[i];

    const ktri = ri instanceof pkijs.KeyTransRecipientInfo
      ? ri
      : ri.variant === 1 && ri.value instanceof pkijs.KeyTransRecipientInfo
        ? ri.value
        : null;

    if (ktri) {
      for (const keyRecord of keyRecords) {
        if (matchesKeyTransRecipient(ktri, keyRecord)) {
          matches.push({ keyRecord, recipientIndex: i });
        }
      }
    }
  }

  return matches;
}

function matchesKeyTransRecipient(recipientInfo, keyRecord) {
  const rid = recipientInfo.rid;

  if (rid instanceof pkijs.IssuerAndSerialNumber) {
    try {
      const certAsn1 = asn1js.fromBER(keyRecord.certificate);
      if (certAsn1.offset === -1) return false;
      const cert = new pkijs.Certificate({ schema: certAsn1.result });

      const ridSerial = toHex(rid.serialNumber.valueBlock.valueHexView);
      const certSerial = toHex(cert.serialNumber.valueBlock.valueHexView);
      if (ridSerial !== certSerial) return false;

      const ridIssuerDer = rid.issuer.toSchema().toBER(false);
      const certIssuerDer = cert.issuer.toSchema().toBER(false);
      return arraysEqual(new Uint8Array(ridIssuerDer), new Uint8Array(certIssuerDer));
    } catch {
      return false;
    }
  }

  if (rid instanceof asn1js.OctetString) {
    try {
      const certAsn1 = asn1js.fromBER(keyRecord.certificate);
      if (certAsn1.offset === -1) return false;
      const cert = new pkijs.Certificate({ schema: certAsn1.result });

      const skiExt = cert.extensions?.find((ext) => ext.extnID === '2.5.29.14');
      if (!skiExt) return false;

      const skiValue = asn1js.fromBER(skiExt.extnValue.valueBlock.valueHexView);
      if (skiValue.offset === -1) return false;
      const ski = skiValue.result.valueBlock.valueHexView;

      return arraysEqual(new Uint8Array(ski), new Uint8Array(rid.valueBlock.valueHexView));
    } catch {
      return false;
    }
  }

  return false;
}

async function decryptWithKey(envelopedData, recipientIndex, privateKey, keyRecord) {
  const certAsn1 = asn1js.fromBER(keyRecord.certificate);
  const cert = new pkijs.Certificate({ schema: certAsn1.result });

  return withLinerEngine(async () => {
    const cryptoEngine = getLinerCryptoEngine();
    return envelopedData.decrypt(
      recipientIndex,
      { recipientCertificate: cert, recipientPrivateKey: privateKey },
      cryptoEngine,
    );
  });
}
