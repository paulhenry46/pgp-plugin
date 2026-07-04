import * as asn1js from 'asn1js';
import * as pkijs from 'pkijs';
import { parseCertificateDer } from './certificate-utils.js';
import { nativeEngine } from './crypto-engine.js';

/**
 * Produce an opaque CMS SignedData wrapping the given MIME content.
 * Content type: application/pkcs7-mime; smime-type=signed-data.
 * Ported from lib/smime/smime-sign.ts.
 */
export async function smimeSign(mimeBytes, privateKey, signerCertDer, chainCertsDer = []) {
  const signerCert = parseCertificateDer(signerCertDer);
  const chainCerts = chainCertsDer.map((der) => parseCertificateDer(der));

  const cmsSigned = new pkijs.SignedData({
    version: 1,
    encapContentInfo: new pkijs.EncapsulatedContentInfo({
      eContentType: '1.2.840.113549.1.7.1', // id-data
      eContent: new asn1js.OctetString({
        valueHex: new Uint8Array(
          mimeBytes.buffer.slice(mimeBytes.byteOffset, mimeBytes.byteOffset + mimeBytes.byteLength),
        ),
      }),
    }),
    signerInfos: [
      new pkijs.SignerInfo({
        version: 1,
        sid: new pkijs.IssuerAndSerialNumber({
          issuer: signerCert.issuer,
          serialNumber: signerCert.serialNumber,
        }),
      }),
    ],
    certificates: [signerCert, ...chainCerts],
  });

  const hashAlgorithm = 'SHA-256';
  await cmsSigned.sign(privateKey, 0, hashAlgorithm, undefined, nativeEngine());

  const cms = new pkijs.ContentInfo({
    contentType: '1.2.840.113549.1.7.2', // id-signedData
    content: cmsSigned.toSchema(true),
  });

  const cmsBytes = cms.toSchema().toBER(false);
  return new Blob([cmsBytes], { type: 'application/pkcs7-mime; smime-type=signed-data' });
}
