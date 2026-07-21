import host from '@plugin-host';
import * as openpgp from 'openpgp'; 


import { buildMimeMessage, wrapAsPgpMimeEncrypted, wrapAsPgpMimeSigned } from '../mime/builder.ts';
import { pgpSignDetached } from '../pgp/pgp-sign.ts';
import { pgpEncrypt } from '../pgp/encrypt.ts';
import { clearArmoredPrivateKeyToPrivateKey } from '../util.ts';
import { KeyRecord, listKeyRecords, listPublicCerts } from '../storage.ts';

import {emailsOf, bytesArrayBuffer} from '../util.ts';
import { INTENT_KEY, settings} from '../shared.ts';
import { isCapable } from '../index.tsx';
import { fetchKeyFromBackground } from '../pgp/session-broadcast.ts';
import { recipientKeysFor } from '../pgp/key-utils.ts';


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

 async function signingKeyRecordForEmail(fromEmail: string | undefined): Promise<KeyRecord | undefined> {
  const recs = await listKeyRecords();
  const lower = (fromEmail || '').toLowerCase();
  return (
    recs.find((r) => r.email === lower && r.capabilities?.canSign !== false) ||
    recs.find((r) => r.email === lower) ||
    undefined
  );
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

  const { sign, encrypt } = await resolveIntent(req);
  if (!sign && !encrypt) return undefined;
  if (!(await isCapable())) {
    host.toast.error(host.i18n.t('error.not_privileged_tier'));
    return false;
  }

  try {
    const identityId = req.identityId || req.identity || '';

    if (!identityId) throw new Error(host.i18n.t('error.no_identity'));

    const from = {addr: req.fromEmail, name: req.fromName};

    if (!from.addr) throw new Error(host.i18n.t('error.no_sender_address'));

    const allRecipientEmails = [...new Set([...emailsOf(req.to), ...emailsOf(req.cc), ...emailsOf(req.bcc)])];
    if (allRecipientEmails.length === 0) {
      throw new Error(host.i18n.t('error.no_recipients'));
    }

    // Unification du Message-ID unique pour le triptyque (réseau + sent)
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

    // 1. Détection des clés publiques pour les destinataires
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

    // Récupération de la clé privée de signature si nécessaire
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

    // 2. Construction du message MIME clair de base
    const attachments = await fetchAttachments(req);
    if (settings().alwaysSendPubKey && currentKeyRecord?.publicKey) {
      attachments.push({
        filename: `${from.addr}_publickey.asc`,
        contentType: 'application/pgp-keys',
        content: new TextEncoder().encode(currentKeyRecord.publicKey),
      });
    }

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

    // 3. Traitement des 3 scénarios (100% PGP, Mixte, 0% PGP/Signature)

    // --- SCÉNARIO A : 100% PGP (Tous les destinataires ont une clé PGP) ---
    if (encrypt && nonPgpRecipients.length === 0) {
      const encryptedBlob = await pgpEncrypt(
        clearMimeBytes,
        Object.values(foundKeys),
        currentKeyRecord.publicKey,
        signingKeyForPgp
      );

      const finalEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedBlob, {
        from, to: req.to, cc: req.cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId
      });

      const rawBytes = await blobToBytes(finalEnvelopeBlob);
      await host.jmap.sendRaw(bytesArrayBuffer(rawBytes), identityId, { envelopeRecipients: allRecipientEmails });
    }
    
    // --- SCÉNARIO B : Mixte (Certains destinataires PGP, d'autres non-PGP) ---
    else if (encrypt && pgpRecipients.length > 0 && nonPgpRecipients.length > 0) {
      const clearReferences = req.references 
        ? `${req.references} ${messageId}` 
        : messageId;

      const clearMessageId = messageId.replace('@', '-clear@');

      // Helper ultra-robuste pour extraire proprement l'adresse email d'un destinataire
      const getAddrString = (item: any): string => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item.addr || item.email || item.address || item.mailbox || '';
      };

      // Helper pour filtrer la liste des destinataires selon une liste d'emails autorisés
      const filterRecipients = (list: any, allowedEmails: string[]) => {
        if (!list) return [];
        const entries = Array.isArray(list) ? list : [list];
        const normalizedAllowed = allowedEmails.map(e => e.toLowerCase().trim());

        return entries.filter((item: any) => {
          const addr = getAddrString(item);
          return normalizedAllowed.includes(addr.toLowerCase().trim());
        });
      };

      // 1. Filtrage initial
      let pgpTo = filterRecipients(req.to, pgpRecipients);
      let pgpCc = filterRecipients(req.cc, pgpRecipients);

      let nonPgpTo = filterRecipients(req.to, nonPgpRecipients);
      let nonPgpCc = filterRecipients(req.cc, nonPgpRecipients);

      // 2. Garants RFC 5322 : Secours si 'To' est vide après filtrage
      if (pgpTo.length === 0) {
        pgpTo = pgpCc.length > 0 ? pgpCc : pgpRecipients;
        if (pgpCc.length > 0) pgpCc = [];
      }

      if (nonPgpTo.length === 0) {
        nonPgpTo = nonPgpCc.length > 0 ? nonPgpCc : nonPgpRecipients;
        if (nonPgpCc.length > 0) nonPgpCc = [];
      }

      // B.1 : Enveloppe PGP (Adressée UNIQUEMENT aux destinataires PGP)
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

      // B.2 : Enveloppe en clair / signée (Adressée UNIQUEMENT aux destinataires non-PGP)
      let clearEnvelopeBlob: Blob;

      if (sign && signingKeyForPgp) {
        const signatureBlob = await pgpSignDetached(clearMimeBytes, signingKeyForPgp);
        const clearMimeBytesBlob = new Blob([clearMimeBytes.slice().buffer], { type: 'application/octet-stream' });
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
        clearEnvelopeBlob = new Blob([clearMimeWithClearID.slice().buffer], { type: 'application/octet-stream' });
      }

      const pgpBytes = await blobToBytes(pgpEnvelopeBlob);
      const clearBytes = await blobToBytes(clearEnvelopeBlob);

      // B.3 : Envois réseau ciblés
      await host.jmap.submitRaw(bytesArrayBuffer(pgpBytes), identityId, { envelopeRecipients: pgpRecipients });

      await host.jmap.submitRaw(bytesArrayBuffer(clearBytes), identityId, { envelopeRecipients: nonPgpRecipients });

      // B.4 : Stockage dans "Sent" (Version chiffrée avec la liste originale complète)
      const sentEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedBlob, {
        from, 
        to: req.to, 
        cc: req.cc, 
        subject: req.subject || '', 
        inReplyTo: req.inReplyTo, 
        references: req.references, 
        messageId
      });
      const sentBytes = await blobToBytes(sentEnvelopeBlob);
      await host.jmap.importRaw(bytesArrayBuffer(sentBytes), ['sent']);
    }

    // --- SCÉNARIO C : 0% PGP / Signature seule (Zero-Knowledge dans Sent) ---
    else {
      // C.1 : Enveloppe à envoyer sur le réseau (en clair ou signée)
      let networkEnvelopeBlob: Blob;
      if (sign && signingKeyForPgp) {
        const signatureBlob = await pgpSignDetached(clearMimeBytes, signingKeyForPgp);
        const clearMimeBytesBlob = new Blob([clearMimeBytes.slice().buffer], { type: 'application/octet-stream' });

        networkEnvelopeBlob = wrapAsPgpMimeSigned(clearMimeBytesBlob, signatureBlob, {
          from, to: req.to, cc: req.cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId
        });
      } else {
        networkEnvelopeBlob = new Blob([clearMimeBytesWithID.slice().buffer], { type: 'application/octet-stream' });
      }

      // C.2 : Enveloppe chiffrée UNIQUEMENT avec la clé publique de l'expéditeur pour le dossier Sent
      const encryptedForSelfBlob = await pgpEncrypt(
        clearMimeBytes,
        [], // Aucun destinataire externe
        currentKeyRecord.publicKey, // Uniquement la clé expéditeur
        signingKeyForPgp // Signé également si demandé
      );

      const sentEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedForSelfBlob, {
        from, to: req.to, cc: req.cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId
      });

      const networkBytes = await blobToBytes(networkEnvelopeBlob);
      const sentBytes = await blobToBytes(sentEnvelopeBlob);

      // C.3 : Envoi sur le réseau (sans archivage auto)
      await host.jmap.submitRaw(bytesArrayBuffer(networkBytes), identityId, { envelopeRecipients: allRecipientEmails });

      // C.4 : Archivage de la version chiffrée dans le dossier "Sent"
      await host.jmap.importRaw(bytesArrayBuffer(sentBytes), ['sent']);
    }

    // Toasts de confirmation
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