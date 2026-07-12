import host from '@plugin-host';
import * as openpgp from 'openpgp'; 


import { buildMimeMessage, wrapAsPgpMimeEncrypted, wrapAsPgpMimeSigned } from '../mime/builder.ts';
import { pgpSignDetached } from '../pgp/pgp-sign.ts';
import { pgpEncrypt } from '../pgp/encrypt.ts';
import { clearArmoredPrivateKeyToPrivateKey, recipientKeysFor, signingKeyRecordForEmail } from '../util.ts';
import { KeyRecord } from '../storage.ts';

import {emailsOf, blobToBytes, bytesArrayBuffer} from '../util.ts';
import { INTENT_KEY, settings} from '../shared.ts';
import { isCapable } from '../index.tsx';
import { fetchKeyFromBackground } from '../pgp/session-broadcast.ts';


export interface ComposeAttachment {
  name: string;
  type: string;
  size: number;
  blobId: string;
  cid?: string;
}

export interface ComposeRequest {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  htmlBody: string;
  textBody: string;
  identityId: string;
  identity?: string; 
  fromEmail: any;
  fromName: any;
  from?: any;     
  inReplyTo?: string;
  references?: string[];
  delayedUntil?: string | null;
  attachments: ComposeAttachment[];
  messageId?: string;
  text?: string;      
  html?: string;      
}
async function resolveIntent(req:any) {
  const pick = (...vals:any[]) => {
    for (const v of vals) if (typeof v === 'boolean') return v;
    return undefined;
  };
  let sign = pick(req.sign, req.smimeSign, req.intent && req.intent.sign, req.smime && req.smime.sign);
  let encrypt = pick(req.encrypt, req.smimeEncrypt, req.intent && req.intent.encrypt, req.smime && req.smime.encrypt);

  if (sign === undefined && encrypt === undefined) {
    const stored = (await host.storage.get(INTENT_KEY)) || {};
    sign = typeof stored.sign === 'boolean' ? stored.sign : settings().defaultSign;
    encrypt = typeof stored.encrypt === 'boolean' ? stored.encrypt : settings().defaultEncrypt;
  }
  return { sign: !!sign, encrypt: !!encrypt };
}

async function fetchAttachments(req: ComposeRequest) {
  const list = req.attachments || [];
  const out = [];
  for (const att of list) {
    if (!att || !att.blobId) continue;
    try {
      const bytes = await host.jmap.fetchBlob(att.blobId, { name: att.name, type: att.type });
      out.push({
        filename: att.name || 'attachment',
        contentType: att.type || 'application/octet-stream',
        content: bytes,
      });
    } catch (err) {
      host.log.warn('attachment fetch failed', att.name, err);
      throw new Error(`${host.i18n.t('error.attachment_read_failed_prefix')}${att.name || ''}${host.i18n.t('error.attachment_read_failed_suffix')}`);
    }
  }
  return out;
}
    
export async function onComposeSend(req: ComposeRequest): Promise<boolean | undefined> {
  console.log(req);
  if (!req || typeof req !== 'object') return undefined;

  const { sign, encrypt } = await resolveIntent(req);
  console.log('sign:', sign, 'encrypt:', encrypt);
  if (!sign && !encrypt) return undefined;
  console.log('on continue');
  if (!(await isCapable())) {
    host.toast.error(host.i18n.t('error.not_privileged_tier'));
    return false;
  }

  try {
    const identityId = req.identityId || req.identity || '';

    if (!identityId) throw new Error(host.i18n.t('error.no_identity'));

    const from = {addr: req.fromEmail, name: req.fromName};

    if (!from.addr) throw new Error(host.i18n.t('error.no_sender_address'));
    const allRecipientEmails = [...emailsOf(req.to), ...emailsOf(req.cc), ...emailsOf(req.bcc)];

    console.log('from:' ,req.fromEmail, from.addr);
    let keyRecord: KeyRecord | undefined = undefined;
    if (sign || encrypt) {
      keyRecord = await signingKeyRecordForEmail(from.addr);
    }

    if ((sign || encrypt) && !keyRecord) {
      host.toast.error(`${host.i18n.t('error.no_key_for_email_prefix')}${from.addr}${host.i18n.t('error.no_key_for_email_suffix')}`);
      return false;
    }

    // 1. Generate the clear MIME structure (with mimetext)
    const attachments = await fetchAttachments(req);
    console.log('build Message')
    const clearMimeBytes = buildMimeMessage({
      from,
      to :req.to,
      cc: req.cc,
      subject: req.subject || '',
      textBody: req.textBody || req.text || '',
      htmlBody: req.htmlBody || req.html || '',
      inReplyTo: req.inReplyTo,
      references: req.references,
      attachments,
    });

    let finalEnvelopeBlob: Blob | undefined;
    console.log('builded Message');
    
    const currentKeyRecord = keyRecord as KeyRecord;
    const session = await fetchKeyFromBackground(currentKeyRecord.id);

    // 2. Process cryptographic combinations (Sign, Encrypt, or Sign+Encrypt)
    if (encrypt) {
      console.log('encrypt Message');
      const { found, missing } = await recipientKeysFor(allRecipientEmails);
      console.log('RecipientKey :', found);
      if (missing.length > 0) {
        host.toast.error(`${host.i18n.t('error.missing_encryption_key_prefix')}${missing.join(', ')}`);
        return false;
      }

      // Resolve the signing key if required
      let signingKeyForEncrypt: openpgp.PrivateKey | undefined = undefined;
      if (sign) {
        console.log('preparing native signing key for combined encryption');
        if (!session || !session.signingKey) {
          host.toast.error(host.i18n.t('error.key_locked'));
          return false;
        }
        signingKeyForEncrypt = await clearArmoredPrivateKeyToPrivateKey(session.signingKey);
      }

      // Full encryption (combined with signing if sign is true)
      const encryptedBlob = await pgpEncrypt(
        clearMimeBytes, 
        found, 
        currentKeyRecord.publicKey,
        signingKeyForEncrypt
      );
      
      // Wrap in the strict PGP/MIME multipart/encrypted standard (RFC 3156)
      finalEnvelopeBlob =  wrapAsPgpMimeEncrypted(encryptedBlob, {
        from, to: req.to, cc: req.cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId: req.messageId
      });
      console.log('finalEnvelopeBlob', finalEnvelopeBlob);
    } else if (sign) {
      console.log('sign Message')
      // Case: Signature only (detached multipart/signed)
      if (!session || !session.signingKey) {
        host.toast.error(host.i18n.t('error.key_locked'));
        return false;
      }
      const signatureBlob = await pgpSignDetached(clearMimeBytes, await clearArmoredPrivateKeyToPrivateKey(session.signingKey));
      
      // Convert clearMimeBytes to a blob
      const clearMimeBytesBlob = new Blob([clearMimeBytes.slice().buffer], { type: 'application/octet-stream' });

      finalEnvelopeBlob = wrapAsPgpMimeSigned(clearMimeBytesBlob, signatureBlob, {
        from, to: req.to, cc: req.cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId: req.messageId
      });
    }

    if (!finalEnvelopeBlob) {
      throw new Error(host.i18n.t('error.cryptographic_failed'));
    }
    console.log('finalEnvelopeBlob', finalEnvelopeBlob);

    const final_text = await finalEnvelopeBlob.text();
    console.log('final text: ', final_text);
    const rawBytes = await blobToBytes(finalEnvelopeBlob);
    const envelopeRecipients = [...new Set([...allRecipientEmails])];
    console.log('Sending raw bytes to JMAP:', rawBytes, 'Recipients:', envelopeRecipients);

    const result = await host.jmap.sendRaw(bytesArrayBuffer(rawBytes), identityId, { envelopeRecipients });
    console.log(result);

    host.toast.success(
      encrypt && sign ? host.i18n.t('success.sent_signed_encrypted')
        : encrypt ? host.i18n.t('success.sent_encrypted')
          : host.i18n.t('success.sent_signed'),
    );

    await host.storage.set(INTENT_KEY, {});
    return false;
  } catch (err: any) {
    host.log.error('onComposeSend failed', err);
    const errMsg = err && err.message ? err.message : String(err);
    host.toast.error(`${host.i18n.t('error.send_failed_prefix')}${errMsg}`);
    return false;
  }
}