import host from '@plugin-host';
import * as openpgp from 'openpgp'; 


import { buildMimeMessage, wrapAsPgpMimeEncrypted, wrapAsPgpMimeSigned } from '../mime/builder.ts';
import { pgpSignDetached } from '../pgp/pgp-sign.ts';
import { pgpEncrypt } from '../pgp/encrypt.ts';
import { clearArmoredPrivateKeyToPrivateKey, unlockedDecryptMaps } from '../util.ts';
import { getDefaultKeyRecord, KeyRecord, listKeyRecords } from '../storage.ts';

import {emailsOf, bytesArrayBuffer} from '../util.ts';
import { config, INTENT_KEY, settings} from '../shared.ts';
import { isCapable } from '../index.tsx';
import { checkIsKeyUnlocked, fetchKeyFromBackground } from '../pgp/session-broadcast.ts';
import { recipientKeysFor } from '../pgp/key-utils.ts';
import { pgpDecrypt } from '../pgp/decrypt.ts';


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

export async function signingKeyRecordForEmail(fromEmail: string | undefined): Promise<KeyRecord | undefined> {
  if (!fromEmail) return undefined;

  const recs = await listKeyRecords();
  const lower = fromEmail.toLowerCase();

  const eligibleRecords = recs.filter(
    (r) => r.email?.toLowerCase() === lower && r.capabilities?.canSign !== false
  );

  if (eligibleRecords.length === 0) {
    return recs.find((r) => r.email?.toLowerCase() === lower);
  }

  return eligibleRecords.find((r) => r.main === true) || eligibleRecords[0];
}
  
async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
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
  if (!req || typeof req !== 'object') return undefined;

  if(await config('forceEncryption') === true && !(await getDefaultKeyRecord())){
    host.toast.error(host.i18n.t('prompt.no_default_key.message_sending'));
    return false;
  }
  if(await config('blockUntilDefaultKeyIsAvailable') === true && !(await checkIsKeyUnlocked())){
    host.toast.error(host.i18n.t('prompt.block_until_default_key_is_available.message_sending'));
    return false;
  }

  const { sign, encrypt } = await resolveIntent(req);
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

    const allRecipientEmails = [...new Set([...emailsOf(req.to), ...emailsOf(req.cc), ...emailsOf(req.bcc)])];
    if (allRecipientEmails.length === 0) {
      throw new Error(host.i18n.t('error.no_recipients'));
    }

    // Single unified Message-ID for the triptych (network + sent)
    const domain = from.addr.split('@')[1] || 'localhost';
    const messageId = `<${crypto.randomUUID()}@${domain}>`;

    let keyRecord: KeyRecord | undefined = undefined;
    if (sign || encrypt) {
      keyRecord = await signingKeyRecordForEmail(from.addr);
    }

    if ((sign || encrypt) && !keyRecord) {
      host.toast.error(`${host.i18n.t('error.no_key_for_email_prefix')}${from.addr}${host.i18n.t('error.no_key_for_email_suffix')}`);
      return false;
    }

    const currentKeyRecord = keyRecord as KeyRecord;

    // 1. Public key detection for recipients (To, Cc, and Bcc combined)
    let pgpRecipients: string[] = [];
    let nonPgpRecipients: string[] = [];
    let foundKeys: Record<string, string> = {};

    if (encrypt) {
      const { found, missing } = await recipientKeysFor(allRecipientEmails);
      foundKeys = found;
      pgpRecipients = Object.keys(found);
      nonPgpRecipients = missing;
    } else {
      nonPgpRecipients = [...allRecipientEmails];
    }

    // Retrieve the signing private key if required
    let signingKeyForPgp: openpgp.PrivateKey | undefined = undefined;
    let session = undefined;

    if (sign) {
      session = await fetchKeyFromBackground(currentKeyRecord.id);
      if (!session || !session.signingKey) {
        host.toast.error(host.i18n.t('error.key_locked'));
        return false;
      }
      signingKeyForPgp = await clearArmoredPrivateKeyToPrivateKey(session.signingKey);
    }

    // 2. Build base clear MIME message
    const attachments = await fetchAttachments(req);
    if (settings().encryptDrafts == true || await config('forceDraftAndAttachmentsEncryption') == true) {
      const { keyRecords, unlockedKeys } = await unlockedDecryptMaps();
      const decryptedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          const { mimeBytes } = await pgpDecrypt({
            cmsBytes: attachment.content,
            keyRecords,
            unlockedKeys,
          });

          return {
            ...attachment,
            content: mimeBytes
          };
        })
      );

      attachments.splice(0, attachments.length, ...decryptedAttachments);
    }

    if (settings().alwaysSendPubKey && currentKeyRecord?.publicKey) {
      attachments.push({
        filename: `${from.addr}_publickey.asc`,
        contentType: 'application/pgp-keys',
        content: new TextEncoder().encode(currentKeyRecord.publicKey),
      });
    }

    // Note: Do NOT pass req.bcc to buildMimeMessage to prevent the Bcc header from being exposed in the MIME body
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
    // Build a version of the clear MIME message without headers for signing without encrypting purposes
     const clearMimeBytesWithoutHeaders = buildMimeMessage({
      from,
      to: req.to,
      cc: req.cc,
      subject: req.subject || '',
      textBody: req.textBody || req.text || '',
      htmlBody: req.htmlBody || req.html || '',
      inReplyTo: req.inReplyTo,
      references: req.references,
      attachments,
    }, false);

    const clearMimeBytesWithID = buildMimeMessage({
      from,
      to: req.to,
      cc: req.cc,
      subject: req.subject || '',
      textBody: req.textBody || req.text || '',
      htmlBody: req.htmlBody || req.html || '',
      inReplyTo: req.inReplyTo,
      references: req.references,
      attachments,
      messageId
    });

    // 3. Process the 3 scenarios (100% PGP, Mixed, 0% PGP / Signature only)

    // --- SCENARIO A: 100% PGP (All recipients have a PGP key) ---
    if (encrypt && nonPgpRecipients.length === 0) {
      const encryptedBlob = await pgpEncrypt(
        clearMimeBytes,
        Object.values(foundKeys),
        currentKeyRecord.publicKey,
        signingKeyForPgp
      );

      // Omit Bcc from MIME headers to maintain privacy
      const finalEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedBlob, {
        from, to: req.to, cc: req.cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId
      });
      host.log.info('final message text - Scenario A:', new TextDecoder().decode(await finalEnvelopeBlob.arrayBuffer()));

      const rawBytes = await blobToBytes(finalEnvelopeBlob);
      // allRecipientEmails includes ALL emails (To + Cc + Bcc) for SMTP/JMAP delivery
      await host.jmap.sendRaw(bytesArrayBuffer(rawBytes), identityId, { envelopeRecipients: allRecipientEmails });
    }
    
    // --- SCENARIO B: Mixed (Some PGP recipients, some non-PGP) ---
    else if (encrypt && pgpRecipients.length > 0 && nonPgpRecipients.length > 0) {
      const continueSending = await host.ui.confirm({
        title: host.i18n.t('confirm.mixed_recipients_title'),
        message: host.i18n.t('confirm.mixed_recipients_message'),
        danger: true,
        confirmLabel: host.i18n.t('confirm.mixed_recipients_confirm'),
      });

      if (!continueSending) {
        return false;
      }
      
      const clearReferences = req.references 
        ? `${req.references} ${messageId}` 
        : messageId;

      const clearMessageId = messageId.replace('@', '-clear@');

      // Helper to extract email address cleanly
      const getAddrString = (item: any): string => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item.addr || item.email || item.address || item.mailbox || '';
      };

      // Helper for filtering recipient lists
      const filterRecipients = (list: any, allowedEmails: string[]) => {
        if (!list) return [];
        const entries = Array.isArray(list) ? list : [list];
        const normalizedAllowed = allowedEmails.map(e => e.toLowerCase().trim());

        return entries.filter((item: any) => {
          const addr = getAddrString(item);
          return normalizedAllowed.includes(addr.toLowerCase().trim());
        });
      };

      // 1. Initial filtering of PGP and Non-PGP recipients
      let pgpTo = filterRecipients(req.to, pgpRecipients);
      let pgpCc = filterRecipients(req.cc, pgpRecipients);
      let pgpBcc = filterRecipients(req.bcc, pgpRecipients);

      let nonPgpTo = filterRecipients(req.to, nonPgpRecipients);
      let nonPgpCc = filterRecipients(req.cc, nonPgpRecipients);
      let nonPgpBcc = filterRecipients(req.bcc, nonPgpRecipients);

      // 2. RFC 5322 compliance fallback: Fallback if 'To' is empty after filtering
      if (pgpTo.length === 0) {
        pgpTo = pgpCc.length > 0 ? pgpCc : (pgpBcc.length > 0 ? pgpBcc : pgpRecipients);
        if (pgpCc.length > 0) pgpCc = [];
      }

      if (nonPgpTo.length === 0) {
        nonPgpTo = nonPgpCc.length > 0 ? nonPgpCc : (nonPgpBcc.length > 0 ? nonPgpBcc : nonPgpRecipients);
        if (nonPgpCc.length > 0) nonPgpCc = [];
      }

      // Build the complete list of envelope recipients for PGP (To + Cc + Bcc)
      const pgpEnvelopeRecipients = [
        ...emailsOf(pgpTo),
        ...emailsOf(pgpCc),
        ...emailsOf(pgpBcc)
      ];

      // Build the complete list of envelope recipients for Non-PGP (To + Cc + Bcc)
      const nonPgpEnvelopeRecipients = [
        ...emailsOf(nonPgpTo),
        ...emailsOf(nonPgpCc),
        ...emailsOf(nonPgpBcc)
      ];

      // B.1: PGP Envelope (Without including Bcc in visible headers)
      const encryptedBlob = await pgpEncrypt(
        clearMimeBytes,
        Object.values(foundKeys),
        currentKeyRecord.publicKey,
        signingKeyForPgp
      );

      const pgpEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedBlob, {
        from, 
        to: pgpTo, 
        cc: pgpCc, 
        subject: req.subject || '', 
        inReplyTo: req.inReplyTo, 
        references: req.references, 
        messageId
      });

      // B.2: Cleartext / Signed Envelope (Without including Bcc in visible headers)
      let clearEnvelopeBlob: Blob;

      if (sign && signingKeyForPgp) {
        const signatureBlob = await pgpSignDetached(clearMimeBytesWithoutHeaders, signingKeyForPgp);
        const clearMimeBytesBlob = new Blob([clearMimeBytesWithoutHeaders as BlobPart], { type: 'application/octet-stream' });
        clearEnvelopeBlob = wrapAsPgpMimeSigned(clearMimeBytesBlob, signatureBlob, {
          from, 
          to: nonPgpTo, 
          cc: nonPgpCc, 
          subject: req.subject || '', 
          inReplyTo: req.inReplyTo, 
          references: [clearReferences], 
          messageId: clearMessageId,
        });
      } else {
        const clearMimeWithClearID = buildMimeMessage({
          from,
          to: nonPgpTo,
          cc: nonPgpCc,
          subject: req.subject || '',
          textBody: req.textBody || req.text || '',
          htmlBody: req.htmlBody || req.html || '',
          inReplyTo: req.inReplyTo,
          references: [clearReferences],
          attachments,
          messageId: clearMessageId
        });
        clearEnvelopeBlob = new Blob([clearMimeWithClearID as BlobPart], { type: 'application/octet-stream' });
      }

      const pgpBytes = await blobToBytes(pgpEnvelopeBlob);
      const clearBytes = await blobToBytes(clearEnvelopeBlob);

      // B.3: Targeted network deliveries (passing full envelope lists including Bcc)
      host.log.info('final message text - Scenario B - PGP envelope:', new TextDecoder().decode(await pgpEnvelopeBlob.arrayBuffer()));
      host.log.info('final message text - Scenario B - Non PGP envelope:', new TextDecoder().decode(await clearEnvelopeBlob.arrayBuffer()));
      await host.jmap.submitRaw(bytesArrayBuffer(pgpBytes), identityId, { envelopeRecipients: pgpEnvelopeRecipients });

      await host.jmap.submitRaw(bytesArrayBuffer(clearBytes), identityId, { envelopeRecipients: nonPgpEnvelopeRecipients });

      // B.4: Storage in "Sent" folder (Keep encrypted copy with original To/Cc/Bcc recipients for your own records)
      const sentEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedBlob, {
        from, 
        to: req.to, 
        cc: req.cc, 
        bcc: req.bcc, // Optional: preserved in 'Sent' so YOU know who it was sent to
        subject: req.subject || '', 
        inReplyTo: req.inReplyTo, 
        references: req.references, 
        messageId
      });
      const sentBytes = await blobToBytes(sentEnvelopeBlob);
      await host.jmap.importRaw(bytesArrayBuffer(sentBytes), ['sent']);
    }

    // --- SCÉNARIO C: 0% PGP / Signature only (Zero-Knowledge in Sent) ---
    else {
      // C.1: Network envelope (cleartext or signed)
      let networkEnvelopeBlob: Blob;
      if (sign && signingKeyForPgp) {
        const signatureBlob = await pgpSignDetached(clearMimeBytesWithoutHeaders, signingKeyForPgp);
        const clearMimeBytesBlob = new Blob([clearMimeBytesWithoutHeaders as BlobPart], { type: 'application/octet-stream' });

        networkEnvelopeBlob = wrapAsPgpMimeSigned(clearMimeBytesBlob, signatureBlob, {
          from, to: req.to, cc: req.cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId
        });
        host.log.info('final message text - Scenario C (with signature) - Network envelope:', new TextDecoder().decode(await networkEnvelopeBlob.arrayBuffer()));
      } else {
        networkEnvelopeBlob = new Blob([clearMimeBytesWithID as BlobPart], { type: 'application/octet-stream' });
        host.log.info('final message text - Scenario C (no signature) - Network envelope:', new TextDecoder().decode(await networkEnvelopeBlob.arrayBuffer()));
      }

      // C.2: Envelope encrypted ONLY with sender's public key for the Sent folder
      const encryptedForSelfBlob = await pgpEncrypt(
        clearMimeBytes,
        [], // No external recipients
        currentKeyRecord.publicKey, // Sender key only
        signingKeyForPgp // Signed if requested
      );

      const sentEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedForSelfBlob, {
        from, to: req.to, cc: req.cc, bcc: req.bcc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId
      });

      const networkBytes = await blobToBytes(networkEnvelopeBlob);
      const sentBytes = await blobToBytes(sentEnvelopeBlob);

      // C.3: Network delivery (allRecipientEmails correctly targets To, Cc, and Bcc)
      await host.jmap.submitRaw(bytesArrayBuffer(networkBytes), identityId, { envelopeRecipients: allRecipientEmails });

      // C.4: Archive encrypted version in "Sent" folder
      await host.jmap.importRaw(bytesArrayBuffer(sentBytes), ['sent']);
    }

    // Confirmation toasts
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