import * as pkijs from 'pkijs';
import { parseCertificateDer } from './certificate-utils.js';
import { nativeEngine } from './crypto-engine.js';
import { toHex } from './util.js';

/**
 * Produce CMS EnvelopedData for the given MIME content.
 * Content type: application/pkcs7-mime; smime-type=enveloped-data.
 * Always includes the sender's cert so the sender can decrypt their Sent mail.
 * Ported from lib/smime/smime-encrypt.ts.
 */
export async function smimeEncrypt(mimeBytes, recipientCertsDer, senderCertDer, useAes128) {
  const allCertDers = deduplicateCerts([...recipientCertsDer, senderCertDer]);
  if (allCertDers.length === 0) throw new Error('No recipient certificates provided');

  const recipientCerts = allCertDers.map((der) => parseCertificateDer(der));
  const cmsEnveloped = new pkijs.EnvelopedData();

  for (const cert of recipientCerts) {
    cmsEnveloped.addRecipientByCertificate(cert, { oaepHashAlgorithm: 'SHA-256' }, undefined, nativeEngine());
  }

  const contentEncryptionAlgorithm = useAes128
    ? { name: 'AES-GCM', length: 128 }
    : { name: 'AES-GCM', length: 256 };

  await cmsEnveloped.encrypt(
    contentEncryptionAlgorithm,
    mimeBytes.buffer.slice(mimeBytes.byteOffset, mimeBytes.byteOffset + mimeBytes.byteLength),
    nativeEngine(),
  );

  const cms = new pkijs.ContentInfo({
    contentType: '1.2.840.113549.1.7.3', // id-envelopedData
    content: cmsEnveloped.toSchema(),
  });

  const cmsBytes = cms.toSchema().toBER(false);
  return new Blob([cmsBytes], { type: 'application/pkcs7-mime; smime-type=enveloped-data' });
}

function deduplicateCerts(certs) {
  const seen = new Set();
  const result = [];
  for (const cert of certs) {
    const key = toHex(cert);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cert);
    }
  }
  return result;
}
