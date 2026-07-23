import host from '@plugin-host';
import * as openpgp from 'openpgp'; 

import { pgpVerify } from '../pgp/pgp-verify.ts';
import { pgpDecrypt, normalizePgpMessage, PgpKeyLockedError } from '../pgp/decrypt.ts';
import { detectPgp } from '../pgp/detect.ts'; 
import { parseMime } from '../mime/parse.ts';
import { extractKeyInfo, scanAndImportKeysFromAttachments } from '../pgp/key-utils.ts';

import { addrList} from '../util.ts';
import { VERIFY_PREFIX, STATE_PREFIX} from '../shared.ts';
import { listPublicCerts } from '../storage.ts';
import {unlockedDecryptMaps} from '../util.ts';
import { isCapable } from '../index.tsx';
import { indexAndPersistDecryptedMail } from '../cache.ts';

/**
 * Main entry point for rendering PGP-processed email bodies.
 */
export async function onRenderEmailBody(body: any, ctx: any) {
  if (!ctx || !(await isCapable())) return undefined;

  await host.storage.set(VERIFY_PREFIX + ctx.id, { isEncrypted: null, processing: true });

  const detection = detectPgp(ctx.contentType, ctx.bodyStructure, ctx.bodyValues, ctx.attachments, ctx.textBody);
  if (!detection.type) return undefined;

  if (!detection.supported) {
    const status = {
      isSigned: ['pgp-signature-file', 'pgp-mime-signed'].includes(detection.type),
      isEncrypted: false,
      unsupportedReason: `${host.i18n.t('error.unsupported_layout_prefix')}${detection.type}${host.i18n.t('error.unsupported_layout_suffix')}`,
    };
    await persistVerifyStatus(ctx.id, status);
    return undefined;
  }

  const blobId = detection.blobId || ctx.blobId;
  if (!blobId) return undefined;

  const fromEmail = (addrList(ctx.from)[0] || {}).email;

  try {
    const raw = await host.jmap.fetchBlob(blobId);
    const pgpMessageContent = normalizePgpMessage(raw);
    const isEncryptedCase = ['pgp-mime-encrypted', 'pgp-inline-encrypted', 'pgp-encrypted-file'].includes(detection.type);
    const isSignedCase = ['pgp-mime-signed', 'pgp-inline-signed', 'pgp-signature-file'].includes(detection.type);

    const knownPublicKeys = await loadPublicKeys(fromEmail);

    // ── Case 1 : Encrypted (And potentially signed) ──
    if (isEncryptedCase) {
      await persistEmailListState(ctx.id, { isEncrypted: true, decryptionSuccess: null, processing: true });
      const { keyRecords, unlockedKeys } = await unlockedDecryptMaps();

      if (detection.type === 'pgp-inline-encrypted') {
        return await handleInlineEncrypted(body, ctx, detection, keyRecords, unlockedKeys, knownPublicKeys);
      } else {
        return await handleMimeEncrypted(body, ctx, pgpMessageContent, keyRecords, unlockedKeys, knownPublicKeys, fromEmail);
      }
    }

    // ── Case 2: Signed Only ──
    if (isSignedCase) {
      const signatureBlock = detection.signatureBlobId ? await host.jmap.fetchBlob(detection.signatureBlobId) : null;
      const signatureString = signatureBlock ? new TextDecoder().decode(signatureBlock) : null;

      const v = await pgpVerify(new TextEncoder().encode(pgpMessageContent), fromEmail, signatureString, knownPublicKeys);
      const parsed = parseMime(v.mimeBytes);

      await persistVerifyStatus(ctx.id, v.status);
      if (parsed.attachments) {
        await scanAndImportKeysFromAttachments(parsed.attachments);
      }

      return {
        ...body,
        handledBy: 'openpgp',
        html: parsed.html || '',
        text: parsed.text || '',
        attachments: parsed.attachments,
        verification: v.status,
      };
    }
  } catch (err) {
    host.log.error('onRenderEmailBody failed', err);
    return undefined;
  }

  return undefined;
}


// ── HELPER FUNCTIONS ──

/**
 * Loads and safe-reads public keys for a specific sender address.
 */
async function loadPublicKeys(fromEmail: string): Promise<any[]> {
  const publicCerts = await listPublicCerts(fromEmail);
  const knownPublicKeys = [];
  for (const cert of publicCerts) {
    try {
      const readK = await openpgp.readKey({ armoredKey: cert.publicKey });
      knownPublicKeys.push(readK);
    } catch {
      /* ignore malformed public certificates safely */
    }
  }
  return knownPublicKeys;
}

/**
 * Sub-handler dealing explicitly with inline encrypted content parsing and nested JSON metadata.
 */
async function handleInlineEncrypted(
  body: any,
  ctx: any,
  detection: any,
  keyRecords: any,
  unlockedKeys: any,
  knownPublicKeys: any[]
) {
  const decoder = new TextDecoder('utf-8');
  let htmlBody = '';
  let textBody = '';
  let attachments = ctx.attachments;

  if (detection.htmlBody) {
    const htmlBytes = (await pgpDecrypt({
      cmsBytes: new TextEncoder().encode(detection.htmlBody),
      keyRecords,
      unlockedKeys,
      knownPublicKeys,
    })).mimeBytes;
    htmlBody = decoder.decode(htmlBytes);
  }

  if (detection.textBody) {
    const textBytes = (await pgpDecrypt({
      cmsBytes: new TextEncoder().encode(detection.textBody),
      keyRecords,
      unlockedKeys,
      knownPublicKeys,
    })).mimeBytes;
    textBody = decoder.decode(textBytes);

    const metadataRegex = /<--PGP_METADATA_START-->([\s\S]*?)<--PGP_METADATA_END-->/;
    const match = textBody.match(metadataRegex);

    if (match && match[1]) {
      try {
        const metadataMap: Record<string, { originalName: string; originalType: string }> = JSON.parse(match[1].trim());
        if (ctx.attachments) {
          const acc = [];

          for(const att of ctx.attachments){
            const meta = metadataMap[att.name];
            if (meta) {

              const decryptedData = (await pgpDecrypt({
                    cmsBytes: await host.jmap.fetchBlob(att.blobId),
                    keyRecords,
                    unlockedKeys,
                    knownPublicKeys,
                  })).mimeBytes;

                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    
                    reader.onloadend = () => {
                      resolve(reader.result as string);
                    };
                    
                    reader.onerror = () => {
                      reject(reader.error);
                    };
                    
                    reader.readAsDataURL(new Blob([decryptedData as BlobPart], { type: meta.originalType }));
                  });

                acc.push({
                  name: meta.originalName,
                  type: meta.originalType,
                  size: att.size || 0,
                  dataUrl: dataUrl,
                });
              }
          }

          attachments=acc

        }
        textBody = textBody.replace(metadataRegex, '').trim();
      } catch (e) {
        throw new Error('Failed to parse attachment metadata: ' + (e instanceof Error ? e.message : String(e)));
      }
    }else if(ctx.attachments && ctx.attachments.length > 0){
      const acc = [];
      for(const att of ctx.attachments){
            
              const decryptedData = (await pgpDecrypt({
                    cmsBytes: await host.jmap.fetchBlob(att.blobId),
                    keyRecords,
                    unlockedKeys,
                    knownPublicKeys,
                  })).mimeBytes;

                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    
                    reader.onloadend = () => {
                      resolve(reader.result as string);
                    };
                    
                    reader.onerror = () => {
                      reject(reader.error);
                    };
                    
                    reader.readAsDataURL(new Blob([decryptedData as BlobPart], { type: att.type }));
                  });

                acc.push({
                  name: att.name,
                  type: att.type,
                  size: att.size || 0,
                  dataUrl: dataUrl,
                });
          }
          attachments=acc
    }
  }
  const verif = { isEncrypted: true, decryptionSuccess: true, isSigned: false }
  await persistVerifyStatus(ctx.id, verif);

  await indexAndPersistDecryptedMail(ctx.id, textBody)
  return {
    ...body,
    handledBy: 'openpgp',
    html: htmlBody,
    text: textBody,
    attachments,
    verification: verif,
  };
}

/**
 * Sub-handler dealing with standard PGP/MIME or standard file encryptions.
 */
async function handleMimeEncrypted(
  body: any,
  ctx: any,
  pgpMessageContent: string,
  keyRecords: any,
  unlockedKeys: any,
  knownPublicKeys: any[],
  fromEmail: string
) {
  let result;
  try {
    result = await pgpDecrypt({
      cmsBytes: new TextEncoder().encode(pgpMessageContent),
      keyRecords,
      unlockedKeys,
      knownPublicKeys,
    });
  } catch (err) {
    const isLocked = err instanceof PgpKeyLockedError;
    const status = {
      isEncrypted: true,
      decryptionSuccess: false,
      decryptionError: isLocked ? 'locked' : String(err),
    };

    await persistVerifyStatus(ctx.id, status);

    const fallbackErrorMessage = `${host.i18n.t('error.decrypt_failed_prefix')}${status.decryptionError}`;
    return {
      ...body,
      handledBy: 'openpgp',
      html: isLocked ? '' : fallbackErrorMessage,
      text: isLocked ? '' : fallbackErrorMessage,
      attachments: [],
      verification: status,
    };
  }

  const verification: any = {
    isEncrypted: true,
    decryptionSuccess: true,
    isSigned: false,
    signatureValid: false,
    signatureError: null,
    signerCert: null,
    signerEmailMatch: null,
  };

  if (result.signatures && result.signatures.length > 0) {
    verification.isSigned = true;
    const sig = result.signatures[0];

    try {
      await sig.verified;
      verification.signatureValid = true;

      const signerKeyID = sig.keyID.toHex().toUpperCase();
      const signingKey = knownPublicKeys.find((key) => key.getKeyID().toHex().toUpperCase() === signerKeyID);

      if (signingKey) {
        const keyInfo = await extractKeyInfo(signingKey);
        verification.signerCert = {
          id: `signer-${keyInfo.fingerprint.replace(/:/g, '')}`,
          email: (keyInfo.emailAddresses[0] ?? '').toLowerCase(),
          fingerprint: keyInfo.fingerprint,
        };
        verification.signerEmailMatch = fromEmail.toLowerCase().trim() === verification.signerCert.email;
      } else {
        verification.signatureValid = false;
        verification.signatureError = `${host.i18n.t('error.unknown_public_key_prefix')}${signerKeyID}${host.i18n.t('error.unknown_public_key_suffix')}`;
      }
    } catch (sigErr) {
      verification.signatureValid = false;
      verification.signatureError = sigErr instanceof Error ? sigErr.message : String(sigErr);
    }
  }

  const parsed = parseMime(result.mimeBytes);
  await persistVerifyStatus(ctx.id, verification);

  if (parsed.attachments) {
    await scanAndImportKeysFromAttachments(parsed.attachments);
  }
   await indexAndPersistDecryptedMail(ctx.id, parsed.text ||parsed.html || '');
  return {
    ...body,
    handledBy: 'openpgp',
    html: parsed.html || '',
    text: parsed.text || '',
    attachments: parsed.attachments,
    verification,
  };
}

async function persistVerifyStatus(emailId: string, status: any) {
  if (!emailId) return;
 try { await host.storage.set(VERIFY_PREFIX + emailId, status); } catch { /* ignore */ }
}

async function persistEmailListState(emailId: string, status: any) {
  if (!emailId) return;
 try { await host.storage.set(STATE_PREFIX + emailId, status); } catch { /* ignore */ }
}


        