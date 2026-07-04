/**
 * PKCS#12 (.p12/.pfx) import + private-key encryption-at-rest / unlock.
 * Ported from lib/smime/pkcs12-import.ts.
 *
 * Private keys are wrapped with AES-GCM under a PBKDF2(600k, SHA-256) key
 * derived from a user passphrase. Unlocked keys are imported NON-EXTRACTABLE.
 */

import * as asn1js from 'asn1js';
import * as pkijs from 'pkijs';
import { generateUUID } from './util.js';
import { extractCertificateInfo, classifyCapabilities } from './certificate-utils.js';
import { withLinerEngine, getLinerCrypto } from './crypto-engine.js';

const KDF_ITERATIONS = 600_000;
const AES_KEY_LENGTH = 256;

function stringToAB(str) {
  const buf = new ArrayBuffer(str.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) view[i] = str.charCodeAt(i);
  return buf;
}

/** Parse a PKCS#12 file and produce an encrypted-at-rest key record. */
export async function importPkcs12(p12Bytes, p12Passphrase, storagePassphrase) {
  const asn1 = asn1js.fromBER(p12Bytes);
  if (asn1.offset === -1) throw new Error('Invalid PKCS#12 file: ASN.1 parsing failed');

  const pfx = new pkijs.PFX({ schema: asn1.result });

  await withLinerEngine(async () => {
    await pfx.parseInternalValues({ password: stringToAB(p12Passphrase) });
  });

  let leafCertDer = null;
  let leafCert = null;
  const chainCertsDer = [];
  let privateKeyInfo = null;

  if (!pfx.parsedValue?.authenticatedSafe) {
    throw new Error('PKCS#12 file does not contain an authenticated safe');
  }

  const authSafe = pfx.parsedValue.authenticatedSafe;
  const safeContentsParams = authSafe.safeContents.map((ci) =>
    ci.contentType === '1.2.840.113549.1.7.6' ? { password: stringToAB(p12Passphrase) } : {},
  );
  await withLinerEngine(async () => {
    await authSafe.parseInternalValues({ safeContents: safeContentsParams });
  });

  for (const safeContent of authSafe.parsedValue.safeContents) {
    const sc = safeContent.value ?? safeContent.parsedValue;
    if (!sc) continue;

    for (const safeBag of sc.safeBags) {
      switch (safeBag.bagId) {
        case '1.2.840.113549.1.12.10.1.3': { // CertBag
          const certBag = safeBag.bagValue;
          let cert = null;
          let der = null;

          if (certBag.parsedValue instanceof pkijs.Certificate) {
            cert = certBag.parsedValue;
            der = cert.toSchema(true).toBER(false);
          } else if (certBag.certId === '1.2.840.113549.1.9.22.1' && certBag.certValue) {
            const certDerBytes = certBag.certValue.valueBlock.valueHexView;
            const certAsn1 = asn1js.fromBER(certDerBytes);
            if (certAsn1.offset !== -1) {
              cert = new pkijs.Certificate({ schema: certAsn1.result });
              der = new Uint8Array(certDerBytes).buffer;
            }
          }

          if (cert && der) {
            if (!leafCertDer) {
              leafCertDer = der;
              leafCert = cert;
            } else {
              chainCertsDer.push(der);
            }
          }
          break;
        }
        case '1.2.840.113549.1.12.10.1.1': { // KeyBag (unencrypted)
          privateKeyInfo = safeBag.bagValue;
          break;
        }
        case '1.2.840.113549.1.12.10.1.2': { // PKCS8ShroudedKeyBag (encrypted)
          const shroudedBag = safeBag.bagValue;
          if (shroudedBag.parsedValue) {
            privateKeyInfo = shroudedBag.parsedValue;
          } else {
            await withLinerEngine(async () => {
              await shroudedBag.parseInternalValues({ password: stringToAB(p12Passphrase) });
            });
            if (shroudedBag.parsedValue) privateKeyInfo = shroudedBag.parsedValue;
          }
          break;
        }
      }
    }
  }

  if (!leafCert || !leafCertDer) throw new Error('No certificate found in PKCS#12 file');
  if (!privateKeyInfo) throw new Error('No private key found in PKCS#12 file');

  const pkcs8Bytes = privateKeyInfo.toSchema().toBER(false);
  const { encrypted, salt, iv } = await encryptPrivateKey(pkcs8Bytes, storagePassphrase);

  const certInfo = await extractCertificateInfo(leafCert, leafCertDer);
  const capabilities = classifyCapabilities(leafCert);
  const email = certInfo.emailAddresses[0] ?? '';

  const keyRecord = {
    id: generateUUID(),
    email: email.toLowerCase(),
    certificate: leafCertDer,
    certificateChain: chainCertsDer,
    encryptedPrivateKey: encrypted,
    salt,
    iv,
    kdfIterations: KDF_ITERATIONS,
    issuer: certInfo.issuer,
    subject: certInfo.subject,
    serialNumber: certInfo.serialNumber,
    notBefore: certInfo.notBefore,
    notAfter: certInfo.notAfter,
    fingerprint: certInfo.fingerprint,
    algorithm: certInfo.algorithm,
    capabilities,
  };

  return { keyRecord, certInfo };
}

// ── Private key encryption / decryption ──────────────────────────────

async function deriveWrappingKey(passphrase, salt, iterations) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptPrivateKey(pkcs8Bytes, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(32)).buffer;
  const iv = crypto.getRandomValues(new Uint8Array(12)).buffer;
  const wrappingKey = await deriveWrappingKey(passphrase, salt, KDF_ITERATIONS);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrappingKey, pkcs8Bytes);
  return { encrypted, salt, iv };
}

function ecdsaCurveFromAlg(alg) {
  if (alg.includes('P256') || alg.includes('P-256')) return 'P-256';
  if (alg.includes('P384') || alg.includes('P-384')) return 'P-384';
  if (alg.includes('P521') || alg.includes('P-521')) return 'P-521';
  return 'P-256';
}

/**
 * Decrypt stored PKCS#8 bytes and import as non-extractable CryptoKeys.
 * @returns { signingKey, decryptionKey?, legacyDecryptionKey? }
 */
export async function unlockPrivateKey(record, passphrase) {
  const wrappingKey = await deriveWrappingKey(passphrase, record.salt, record.kdfIterations);

  let pkcs8Bytes;
  try {
    pkcs8Bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: record.iv }, wrappingKey, record.encryptedPrivateKey);
  } catch {
    throw new Error('Incorrect passphrase');
  }

  const isEcdsa = record.algorithm.startsWith('ECDSA');
  const signAlg = isEcdsa
    ? { name: 'ECDSA', namedCurve: ecdsaCurveFromAlg(record.algorithm) }
    : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
  const decryptAlg = isEcdsa
    ? { name: 'ECDH', namedCurve: ecdsaCurveFromAlg(record.algorithm) }
    : { name: 'RSA-OAEP', hash: 'SHA-256' };
  const decryptUsages = isEcdsa ? ['deriveBits'] : ['decrypt'];

  let signingKey;
  try {
    signingKey = await crypto.subtle.importKey('pkcs8', pkcs8Bytes, signAlg, false, ['sign']);
  } catch {
    // Key may only support decryption (key-encipherment-only cert)
    const decryptionKey = await crypto.subtle.importKey('pkcs8', pkcs8Bytes, decryptAlg, false, decryptUsages);
    let legacyDecryptionKey;
    if (!isEcdsa) {
      try {
        legacyDecryptionKey = await getLinerCrypto().subtle.importKey(
          'pkcs8', pkcs8Bytes, { name: 'RSAES-PKCS1-v1_5' }, false, ['decrypt'],
        );
      } catch { /* liner unavailable */ }
    }
    return { signingKey: decryptionKey, decryptionKey, legacyDecryptionKey };
  }

  let decryptionKey;
  try {
    decryptionKey = await crypto.subtle.importKey('pkcs8', pkcs8Bytes, decryptAlg, false, decryptUsages);
  } catch { /* signing-only cert */ }

  let legacyDecryptionKey;
  if (!isEcdsa) {
    try {
      legacyDecryptionKey = await getLinerCrypto().subtle.importKey(
        'pkcs8', pkcs8Bytes, { name: 'RSAES-PKCS1-v1_5' }, false, ['decrypt'],
      );
    } catch { /* liner unavailable */ }
  }

  return { signingKey, decryptionKey, legacyDecryptionKey };
}
