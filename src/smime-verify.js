/**
 * Verify CMS SignedData (opaque signed) and extract the inner content.
 * Ported from lib/smime/smime-verify.ts.
 */

import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';
import { extractCertificateInfo } from './certificate-utils.js';
import { nativeEngine } from './crypto-engine.js';
import { arraysEqual, toHex } from './util.js';

/**
 * Verify a CMS SignedData structure and extract the encapsulated content.
 * @returns { mimeBytes: Uint8Array, status: SmimeStatus }
 */
export async function smimeVerify(cmsBytes, fromHeader) {
  const contentInfo = parseContentInfo(cmsBytes);
  const signedData = extractSignedData(contentInfo);

  const innerContent = extractInnerContent(signedData);

  const signerCert = extractSignerCertificate(signedData);
  if (!signerCert) {
    return {
      mimeBytes: innerContent,
      status: {
        isSigned: true,
        isEncrypted: false,
        signatureValid: false,
        signatureError: 'Signer certificate not found in CMS structure',
      },
    };
  }

  let signatureValid = false;
  let signatureError;

  try {
    // checkChain:false — validate the signature cryptographically. Trust of the
    // issuer chain is surfaced separately (selfSigned flag + the banner), rather
    // than collapsing "untrusted issuer" into "invalid signature". This matches
    // how most S/MIME clients present results and keeps validly-signed mail from
    // self-signed or non-bundled CAs from showing a scary "invalid" badge.
    signatureValid = await signedData.verify({ signer: 0, checkChain: false }, nativeEngine());
  } catch (err) {
    signatureError = err instanceof Error ? err.message : 'Signature verification failed';
  }

  const certDer = signerCert.toSchema(true).toBER(false);
  const certInfo = await extractCertificateInfo(signerCert, certDer);

  const now = new Date();
  const notBefore = new Date(certInfo.notBefore);
  const notAfter = new Date(certInfo.notAfter);
  const certExpired = now > notAfter;
  const certNotYetValid = now < notBefore;

  if (certExpired && !signatureError) signatureError = 'Signer certificate has expired';
  if (certNotYetValid && !signatureError) signatureError = 'Signer certificate is not yet valid';

  const signerEmail = certInfo.emailAddresses[0] ?? '';
  const signerPublicCert = {
    id: `signer-${certInfo.fingerprint}`,
    email: signerEmail.toLowerCase(),
    certificate: certDer,
    issuer: certInfo.issuer,
    subject: certInfo.subject,
    notBefore: certInfo.notBefore,
    notAfter: certInfo.notAfter,
    fingerprint: certInfo.fingerprint,
    source: 'signed-email',
  };

  let signerEmailMatch;
  if (fromHeader && signerEmail) {
    signerEmailMatch = fromHeader.toLowerCase() === signerEmail.toLowerCase();
  }

  const issuerDer = new Uint8Array(signerCert.issuer.toSchema().toBER(false));
  const subjectDer = new Uint8Array(signerCert.subject.toSchema().toBER(false));
  const selfSigned = arraysEqual(issuerDer, subjectDer);

  return {
    mimeBytes: innerContent,
    status: {
      isSigned: true,
      isEncrypted: false,
      signatureValid: signatureValid && !certExpired && !certNotYetValid,
      signatureError,
      signerCert: signerPublicCert,
      signerEmailMatch,
      selfSigned,
    },
  };
}

// --- Internal helpers ---

function parseContentInfo(der) {
  const asn1 = asn1js.fromBER(der);
  if (asn1.offset === -1) throw new Error('Invalid ASN.1 data - cannot parse CMS structure');
  return new pkijs.ContentInfo({ schema: asn1.result });
}

function extractSignedData(contentInfo) {
  if (contentInfo.contentType !== '1.2.840.113549.1.7.2') {
    throw new Error(`Unexpected CMS content type: ${contentInfo.contentType}`);
  }
  return new pkijs.SignedData({ schema: contentInfo.content });
}

function extractInnerContent(signedData) {
  const eContent = signedData.encapContentInfo?.eContent;
  if (!eContent) {
    throw new Error('No encapsulated content in SignedData (detached signature not supported)');
  }

  if (eContent instanceof asn1js.OctetString) {
    const children = eContent.valueBlock.value;
    if (children?.length) {
      const chunks = children.map((c) => new Uint8Array(c.valueBlock.valueHexView));
      const total = chunks.reduce((sum, c) => sum + c.length, 0);
      const result = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      return result;
    }
    return new Uint8Array(eContent.valueBlock.valueHexView);
  }

  throw new Error('Unable to extract content from SignedData');
}

function extractSignerCertificate(signedData) {
  if (!signedData.signerInfos?.length || !signedData.certificates?.length) return null;

  const signerInfo = signedData.signerInfos[0];
  const sid = signerInfo.sid;

  if (sid instanceof pkijs.IssuerAndSerialNumber) {
    for (const certItem of signedData.certificates) {
      if (!(certItem instanceof pkijs.Certificate)) continue;
      const cert = certItem;

      const sidSerial = toHex(sid.serialNumber.valueBlock.valueHexView);
      const certSerial = toHex(cert.serialNumber.valueBlock.valueHexView);
      if (sidSerial !== certSerial) continue;

      const sidIssuerDer = new Uint8Array(sid.issuer.toSchema().toBER(false));
      const certIssuerDer = new Uint8Array(cert.issuer.toSchema().toBER(false));
      if (arraysEqual(sidIssuerDer, certIssuerDer)) return cert;
    }
  }

  if (signedData.certificates.length === 1) {
    const cert = signedData.certificates[0];
    if (cert instanceof pkijs.Certificate) return cert;
  }

  return null;
}
