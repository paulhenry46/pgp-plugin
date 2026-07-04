/**
 * Crypto engine backed by webcrypto-liner for legacy algorithm support.
 *
 * webcrypto-liner extends native Web Crypto with algorithms like
 * DES-EDE3-CBC (3DES) that legacy S/MIME clients (Outlook, Thunderbird)
 * still emit. Native algorithms pass through to the real implementation;
 * only the missing ones use the software fallback.
 *
 * Additionally, pkijs's CryptoEngine.decryptEncryptedContentInfo only
 * handles PBES2. Many PKCS#12 files use legacy PBE algorithms; we extend
 * CryptoEngine to handle those via RFC 7292 Appendix B key derivation +
 * webcrypto-liner's DES-EDE3-CBC support.
 *
 * Ported verbatim (TS → JS) from the host's lib/smime/crypto-engine.ts so
 * the plugin produces byte-identical CMS to the former native pipeline.
 */

import * as asn1js from 'asn1js';
import * as pkijs from 'pkijs';
// Import the ES build directly: the package "browser" field points at a
// shim-only build with no named exports (no setCrypto/Crypto).
import * as liner from 'webcrypto-liner/build/index.es.js';

// ── PKCS#12 legacy PBE OIDs ──────────────────────────────────────────
const PBE_SHA1_3DES_3KEY = '1.2.840.113549.1.12.1.3';
const PBE_SHA1_3DES_2KEY = '1.2.840.113549.1.12.1.4';
const PBE_SHA1_RC2_128 = '1.2.840.113549.1.12.1.5';
const PBE_SHA1_RC2_40 = '1.2.840.113549.1.12.1.6';

const LEGACY_PBE_OIDS = new Set([
  PBE_SHA1_3DES_3KEY,
  PBE_SHA1_3DES_2KEY,
  PBE_SHA1_RC2_128,
  PBE_SHA1_RC2_40,
]);

function pbeConfig(oid) {
  switch (oid) {
    case PBE_SHA1_3DES_3KEY: return { keyLen: 24, ivLen: 8, algName: 'DES-EDE3-CBC' };
    case PBE_SHA1_3DES_2KEY: return { keyLen: 16, ivLen: 8, algName: 'DES-EDE3-CBC' };
    case PBE_SHA1_RC2_128:   return { keyLen: 16, ivLen: 8, algName: 'RC2-CBC' };
    case PBE_SHA1_RC2_40:    return { keyLen: 5,  ivLen: 8, algName: 'RC2-CBC' };
    default: throw new Error(`Unsupported legacy PBE OID: ${oid}`);
  }
}

/** PKCS#12 key derivation — RFC 7292, Appendix B. */
async function pkcs12KDF(password, salt, iterations, id, needed) {
  const v = 64; // SHA-1 block size
  const u = 20; // SHA-1 output size

  const D = new Uint8Array(v);
  D.fill(id);

  const sLen = salt.length === 0 ? 0 : v * Math.ceil(salt.length / v);
  const S = new Uint8Array(sLen);
  for (let i = 0; i < sLen; i++) S[i] = salt[i % salt.length];

  const pLen = password.length === 0 ? 0 : v * Math.ceil(password.length / v);
  const P = new Uint8Array(pLen);
  for (let i = 0; i < pLen; i++) P[i] = password[i % password.length];

  const I = new Uint8Array(sLen + pLen);
  I.set(S, 0);
  I.set(P, sLen);

  const c = Math.ceil(needed / u);
  const result = new Uint8Array(c * u);

  for (let i = 0; i < c; i++) {
    const buf = new Uint8Array(v + I.length);
    buf.set(D, 0);
    buf.set(I, v);

    let A = new Uint8Array(await crypto.subtle.digest('SHA-1', buf));
    for (let j = 1; j < iterations; j++) {
      A = new Uint8Array(await crypto.subtle.digest('SHA-1', A));
    }

    result.set(A, i * u);

    if (i + 1 < c) {
      const B = new Uint8Array(v);
      for (let j = 0; j < v; j++) B[j] = A[j % u];

      for (let j = 0; j < I.length; j += v) {
        let carry = 1;
        for (let k = v - 1; k >= 0; k--) {
          const sum = I[j + k] + B[k] + carry;
          I[j + k] = sum & 0xff;
          carry = sum >> 8;
        }
      }
    }
  }

  return result.slice(0, needed);
}

/** Encode a password as BMP string with trailing NUL pair (RFC 7292 §B.1). */
function passwordToBMP(password) {
  const passView = new Uint8Array(password);
  const bmp = new Uint8Array(passView.length * 2 + 2);
  for (let i = 0; i < passView.length; i++) {
    bmp[i * 2] = 0;
    bmp[i * 2 + 1] = passView[i];
  }
  bmp[bmp.length - 2] = 0;
  bmp[bmp.length - 1] = 0;
  return bmp;
}

// ── CMS content encryption OIDs (for EnvelopedData decryption) ─────
const OID_DES_EDE3_CBC = '1.2.840.113549.3.7';
const OID_DES_CBC = '1.3.14.3.2.7';
const OID_RC2_CBC = '1.2.840.113549.3.2';

class Pkcs12CryptoEngine extends pkijs.CryptoEngine {
  getAlgorithmByOID(oid, safety, target) {
    switch (oid) {
      case OID_DES_EDE3_CBC: return { name: 'DES-EDE3-CBC', length: 192 };
      case OID_DES_CBC:      return { name: 'DES-CBC', length: 64 };
      case OID_RC2_CBC:      return { name: 'RC2-CBC', length: 128 };
      default: return super.getAlgorithmByOID(oid, safety, target);
    }
  }

  getOIDByAlgorithm(algorithm, safety, target) {
    switch (algorithm.name.toUpperCase()) {
      case 'DES-EDE3-CBC': return OID_DES_EDE3_CBC;
      case 'DES-CBC':      return OID_DES_CBC;
      case 'RC2-CBC':      return OID_RC2_CBC;
      default: return super.getOIDByAlgorithm(algorithm, safety, target);
    }
  }

  async decryptEncryptedContentInfo(parameters) {
    const oid = parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId;

    if (!LEGACY_PBE_OIDS.has(oid)) {
      return super.decryptEncryptedContentInfo(parameters);
    }

    const algParams = parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams;
    if (!algParams) throw new Error('Missing PBE algorithm parameters');

    const paramAsn1 = asn1js.fromBER(algParams.toBER(false));
    if (paramAsn1.offset === -1) throw new Error('Invalid PBE parameters ASN.1');
    const seq = paramAsn1.result;
    const salt = new Uint8Array(seq.valueBlock.value[0].valueBlock.valueHexView);
    const iterations = seq.valueBlock.value[1].valueBlock.valueDec;

    const { keyLen, ivLen, algName } = pbeConfig(oid);
    const bmpPassword = passwordToBMP(parameters.password);

    const keyBytes = await pkcs12KDF(bmpPassword, salt, iterations, 1, keyLen);
    const ivBytes = await pkcs12KDF(bmpPassword, salt, iterations, 2, ivLen);

    const keyData = new Uint8Array(keyBytes.buffer, keyBytes.byteOffset, keyBytes.byteLength);
    const cryptoKey = await this.importKey(
      'raw',
      keyData,
      { name: algName, length: keyLen * 8 },
      false,
      ['decrypt'],
    );

    const ciphertext = parameters.encryptedContentInfo.getEncryptedContent();
    return this.decrypt({ name: algName, iv: ivBytes }, cryptoKey, ciphertext);
  }
}

let linerEngine = null;
let linerCryptoInstance = null;

function ensureLiner() {
  if (!linerCryptoInstance) {
    if (
      typeof liner.nativeCrypto?.getRandomValues !== 'function' &&
      typeof globalThis.crypto?.subtle !== 'undefined'
    ) {
      liner.setCrypto(globalThis.crypto.subtle);
    }
    linerCryptoInstance = new liner.Crypto();
  }
  if (!linerEngine) {
    linerEngine = new Pkcs12CryptoEngine({
      crypto: linerCryptoInstance,
      subtle: linerCryptoInstance.subtle,
      name: 'webcrypto-liner',
    });
  }
}

/** PKI.js CryptoEngine with 3DES (and other legacy algorithm) support. */
export function getLinerCryptoEngine() {
  ensureLiner();
  return linerEngine;
}

/** The webcrypto-liner Crypto instance (for importKey with legacy algorithms). */
export function getLinerCrypto() {
  ensureLiner();
  return linerCryptoInstance;
}

/** Run fn with the global PKI.js engine set to webcrypto-liner, then restore. */
export async function withLinerEngine(fn) {
  ensureLiner();
  const prev = pkijs.getEngine();
  pkijs.setEngine('webcrypto-liner', linerCryptoInstance, linerEngine);
  try {
    return await fn();
  } finally {
    pkijs.setEngine(prev.name, prev.crypto);
  }
}

/** A plain native-WebCrypto pkijs engine for sign/verify/encrypt fast paths. */
export function nativeEngine() {
  return new pkijs.CryptoEngine({ crypto, subtle: crypto.subtle, name: 'webcrypto' });
}
