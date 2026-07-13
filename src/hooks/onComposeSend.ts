import host from '@plugin-host';
import * as openpgp from 'openpgp'; 


import { buildMimeMessage, wrapAsPgpMimeEncrypted, wrapAsPgpMimeSigned } from '../mime/builder.ts';
import { pgpSignDetached } from '../pgp/pgp-sign.ts';
import { pgpEncrypt } from '../pgp/encrypt.ts';
import { clearArmoredPrivateKeyToPrivateKey, getAvailableKeyId, recipientKeysFor, signingKeyRecordForEmail } from '../util.ts';
import { KeyRecord } from '../storage.ts';

import {emailsOf, blobToBytes, bytesArrayBuffer} from '../util.ts';
import { INTENT_KEY, settings} from '../shared.ts';
import { isCapable } from '../index.tsx';
import { executeCryptText } from '../pgp/session-broadcast.ts';


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
    



// (Conserve tes autres helpers existants comme resolveIntent, fetchAttachments, etc.)

export async function onComposeSend(req: ComposeRequest): Promise<boolean | undefined> {
  console.log(req);
  if (!req || typeof req !== 'object') return undefined;

  const { sign, encrypt } = await resolveIntent(req);
  console.log('sign:', sign, 'encrypt:', encrypt);
  if (!sign && !encrypt) return undefined;
  
  if (!(await isCapable())) {
    host.toast.error(host.i18n.t('error.not_privileged_tier'));
    return false;
  }

  try {
    const identityId = req.identityId || req.identity || '';
    if (!identityId) throw new Error(host.i18n.t('error.no_identity'));

    const from = { addr: req.fromEmail, name: req.fromName };
    if (!from.addr) throw new Error(host.i18n.t('error.no_sender_address'));
    
    const allRecipientEmails = [...emailsOf(req.to), ...emailsOf(req.cc), ...emailsOf(req.bcc)];

    // Récupération sécurisée de l'ID de la clé (sans récupérer la clé privée)
    const keyId = await getAvailableKeyId(from.addr);
    if (!keyId) {
      host.toast.error(`${host.i18n.t('error.no_key_for_email_prefix')}${from.addr}${host.i18n.t('error.no_key_for_email_suffix')}`);
      return false;
    }

    // 1. Génération de la structure MIME en clair (avec mimetext)
    const attachments = await fetchAttachments(req);
    console.log('build Message');
    
    const clearMimeBytes = buildMimeMessage({
      from,
      to: req.to,
      cc: req.cc,
      subject: req.subject || '',
      textBody: req.textBody || req.text || '',
      htmlBody: req.htmlBody || req.html || '',
      inReplyTo: req.inReplyTo,
      references: req.references,
      attachments,
    });

    const clearMimeString = new TextDecoder().decode(clearMimeBytes);
    let finalEnvelopeBlob: Blob | undefined;
    console.log('builded Message');

    // 2. Traitement des combinaisons cryptographiques (Sign, Encrypt, ou Sign+Encrypt) via la Boîte Noire
    if (encrypt) {
      console.log('encrypt Message via Background');
      const { found, missing } = await recipientKeysFor(allRecipientEmails);
      console.log('RecipientKey :', found);
      if (missing.length > 0) {
        host.toast.error(`${host.i18n.t('error.missing_encryption_key_prefix')}${missing.join(', ')}`);
        return false;
      }

      // Le chiffrement complet (avec signature intégrée si sign est vrai) est délégué au Background.
      // Note : Si ton Background gère la signature combinée, passe l'information dans l'action ou l'objet.
      const actionType = sign ? 'encrypt-and-sign' : 'encrypt'; 
      const encryptedString = await executeCryptText(actionType as any, clearMimeString, keyId);

      if (!encryptedString) {
        host.toast.error(host.i18n.t('error.key_locked_or_crypto_failed'));
        return false;
      }

      const encryptedBlob = new Blob([new TextEncoder().encode(encryptedString)], { type: 'application/octet-stream' });
      
      // Emballage dans le standard PGP/MIME multipart/encrypted (RFC 3156)
      finalEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedBlob, {
        from, to: req.to, cc: req.cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId: req.messageId
      });
      console.log('finalEnvelopeBlob', finalEnvelopeBlob);

    } else if (sign) {
      console.log('sign Message via Background');
      
      // Demande de signature détachée au Background
      // Si tu utilises executeCryptText pour la signature, assure-toi que ton Background intercepte l'action 'sign'
      const signatureString = await executeCryptText('sign' as any, clearMimeString, keyId);
      
      if (!signatureString) {
        host.toast.error(host.i18n.t('error.key_locked_or_crypto_failed'));
        return false;
      }

      const signatureBlob = new Blob([new TextEncoder().encode(signatureString)], { type: 'application/pgp-signature' });
      const clearMimeBytesBlob = new Blob([clearMimeBytes.slice().buffer], { type: 'application/octet-stream' });

      // Emballage dans le standard PGP/MIME multipart/signed
      finalEnvelopeBlob = wrapAsPgpMimeSigned(clearMimeBytesBlob, signatureBlob, {
        from, to: req.to, cc: req.cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId: req.messageId
      });
    }

    if (!finalEnvelopeBlob) {
      throw new Error(host.i18n.t('error.cryptographic_failed'));
    }

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