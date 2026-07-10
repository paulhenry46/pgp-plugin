/**
 * OpenPGP — privileged (same-origin) webmail plugin.
 *
 * Replaces the former S/MIME pipeline with an OpenPGP pipeline that
 * runs all cryptography locally (bundled openpgp / mimetext):
 *
 * • onComposeSend   (intercept)  → build MIME via mimetext, sign/encrypt, api.jmap.sendRaw
 * • onRenderEmailBody (transform) → api.jmap.fetchBlob, decrypt/verify, replace body
 * • composer-toolbar slot         → per-message Sign / Encrypt toggles
 * • email-banner slot             → signature / encryption status
 * • settings-section slot         → key import, unlock/lock, recipient public keys
 */
import host from '@plugin-host';
import * as openpgp from 'openpgp'; 


import { buildMimeMessage, wrapAsPgpMimeEncrypted, wrapAsPgpMimeSigned } from './mime/builder.ts';
import { pgpSignDetached } from './pgp/pgp-sign.ts';
import { pgpEncrypt } from './pgp/encrypt.ts';
import { pgpVerify } from './pgp/pgp-verify.ts';
import { pgpDecrypt, normalizePgpMessage, PgpKeyLockedError } from './pgp/decrypt.ts';
import { detectPgp } from './pgp/detect.ts'; 
import { parseMime } from './mime/parse.ts';
import { extractKeyInfo, scanAndImportKeysFromAttachments } from './pgp/key-utils.ts';
import { clearArmoredPrivateKeyToPrivateKey, fetchBlobAsDataUrl, generateUUID } from './util.ts';
import {
  saveKeyRecord, listKeyRecords, deleteKeyRecord, listPublicCerts, deletePublicCert,
  saveSessionKeys, getSessionKeys, deleteSessionKeys, clearSessionKeys, KeyRecord, PublicCert, getDefaultPublicCert
} from './storage.ts';

 import {EmailSecuBanner, EmailBanner} from './ui/banners.tsx';
 import {SettingsSection} from './ui/settings.tsx';
 import {ComposerToolbar} from './ui/composer-toolbar.tsx';
import {emailsOf, blobToBytes, bytesArrayBuffer, addrList} from './util.ts';
import {PREFS_KEY, INTENT_KEY, VERIFY_PREFIX, settings} from './shared.ts';
import { ComposerSidebar } from './ui/composer-sidebar.tsx';


// ─── Privileged-tier capability probe ─────────────────────────────────
export const NOT_PRIVILEGED_MSG =
  'OpenPGP could not start: it is running in the restricted (untrusted) plugin ' +
  'sandbox, where in-browser cryptography and key storage are unavailable. ' +
  'This plugin must be delivered as a signed, admin-approved bundle with ' +
  '"tier": "privileged" so it loads in the same-origin tier. Contact your ' +
  'administrator.';

let _capable: boolean | null = null;
export async function isCapable() {
  if (_capable !== null) return _capable;
  try {
    if (typeof indexedDB === 'undefined' || !(crypto && crypto.subtle)) throw new Error('missing apis');
    await new Promise((resolve, reject) => {
      let req;
      try { req = indexedDB.open('pgp-capability-probe'); }
      catch (e) { reject(e); return; }
      req.onsuccess = () => { try { req.result.close(); } catch { /* ignore */ } resolve(void 0); };
      req.onerror = () => reject(req.error || new Error('indexedDB open failed'));
      req.onblocked = () => resolve(void 0);
    });
    _capable = true;
  } catch {
    _capable = false;
  }
  return _capable;
}


// ─── Key resolution ────────────────────────────────────────────────────

async function signingKeyRecordForEmail(fromEmail: string | undefined): Promise<KeyRecord | undefined> {
  const recs = await listKeyRecords();
  const lower = (fromEmail || '').toLowerCase();
  return (
    recs.find((r) => r.email === lower && r.capabilities?.canSign !== false) ||
    recs.find((r) => r.email === lower) ||
    undefined
  );
}

async function recipientKeysFor(emails:any) {
  const certs = await listPublicCerts();
  const found = [];
  const missing = [];
  for (const email of emails) {
    const c = certs.find((pc) => pc.email.toLowerCase() === email.toLowerCase());
    if (c) found.push(c.publicKey); // Utilise .publicKey au lieu de .certificate
    else missing.push(email);
  }
  return { found, missing };
}

// Build the map of unlocked private keys from the session store.
async function unlockedDecryptMaps() {
  const recs = await listKeyRecords();
  const unlockedKeys = new Map();
  for (const r of recs) {
    const s = await getSessionKeys(r.id);
    if (!s) continue;
    // OpenPGP unifies the decryption key (no legacy key needed anymore)
    if (s.unlockedPrivateKey) unlockedKeys.set(r.id, s.unlockedPrivateKey);
  }
  return { keyRecords: recs, unlockedKeys };
}

// ─── Compose-send takeover ─────────────────────────────────────────────

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
      throw new Error(`Could not read attachment "${att.name || ''}" for encryption`);
    }
  }
  return out;
}

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

export async function onComposeSend(req: ComposeRequest): Promise<boolean | undefined> {
  console.log(req);
  if (!req || typeof req !== 'object') return undefined;

  const { sign, encrypt } = await resolveIntent(req);
  console.log('sign:', sign, 'encrypt:', encrypt);
  if (!sign && !encrypt) return undefined;
  console.log('on continue');
  if (!(await isCapable())) {
    host.toast.error('Cannot sign/encrypt: OpenPGP is not running in the privileged tier.');
    return false;
  }

  try {
    const identityId = req.identityId || req.identity || '';

  if (!identityId) throw new Error('No sending identity available');

    const from = {addr: req.fromEmail, name: req.fromName};

    if (!from.addr) throw new Error('Could not determine sender address');
    const allRecipientEmails = [...emailsOf(req.to), ...emailsOf(req.cc), ...emailsOf(req.bcc)];

    console.log('from:' ,req.fromEmail, from.addr);
    let keyRecord: KeyRecord | undefined = undefined;
    if (sign || encrypt) {
      keyRecord = await signingKeyRecordForEmail(from.addr);
    }

    if ((sign || encrypt) && !keyRecord) {
      host.toast.error(`No OpenPGP key for ${from.addr}. Import one in Settings → Plugins → OpenPGP.`);
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
    const session = await getSessionKeys(currentKeyRecord.id);

    // 2. Process cryptographic combinations (Sign, Encrypt, or Sign+Encrypt)
    if (encrypt) {
      console.log('encrypt Message');
      const { found, missing } = await recipientKeysFor(allRecipientEmails);
      console.log('RecipientKey :', found);
      if (missing.length > 0) {
        host.toast.error(`Missing encryption key for: ${missing.join(', ')}`);
        return false;
      }

      // Resolve the signing key if required
      let signingKeyForEncrypt: openpgp.PrivateKey | undefined = undefined;
      if (sign) {
        console.log('preparing native signing key for combined encryption');
        if (!session || !session.signingKey) {
          host.toast.error('Your OpenPGP key is locked. Unlock it in Settings, then resend.');
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
        host.toast.error('Your OpenPGP key is locked. Unlock it in Settings, then resend.');
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
      throw new Error('Cryptographic processing failed to generate an output envelope.');
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
      encrypt && sign ? 'Message signed, encrypted and sent (PGP/MIME)'
        : encrypt ? 'Message encrypted and sent (PGP/MIME)'
          : 'Message signed and sent (PGP/MIME)',
    );

    await host.storage.set(INTENT_KEY, {});
    return false;
  } catch (err: any) {
    host.log.error('onComposeSend failed', err);
    host.toast.error(`OpenPGP send failed: ${err && err.message ? err.message : String(err)}`);
    return false;
  }
}

// ─── Render-body takeover (verify / decrypt) ───────────────────────────


async function persistVerifyStatus(emailId: string, status: any) {
  if (!emailId) return;
 try { await host.storage.set(VERIFY_PREFIX + emailId, status); } catch { /* ignore */ }
}


export interface  Verification {
isEncrypted: boolean;
decryptionSuccess: boolean;
isSigned: boolean;
signatureValid:boolean;
signatureError: null | string;
signerCert: null | VerifSignerCert;
signerEmailMatch: boolean |null;
}

export interface VerifSignerCert {
id: string;
email: string;
fingerprint: string;
}

 export async function onBeforeBlobUpload(fileId: string) {
  const file = await host.upfiles.get(fileId);
  if (!file) return;
  // Get the pub key
  const key = (await getDefaultPublicCert())?.publicKey
  if (!key) {
    host.toast.error('No default public key found for attachment encryption. Please set a default public key in OpenPGP settings.');  
    return}
  const fileBytes = await file.bytes();
  const encryptedBlob: Blob = await pgpEncrypt(
      fileBytes, 
      [], 
      key
      
    );
  const encryptedFile = new File([encryptedBlob], `encrypted.pgp`, {
      type: 'application/octet-stream'
    });
    
    return await host.upfiles.save(fileId, encryptedFile);
}


export interface AlmostSavedDraft{
   to: string[],
    subject: string,
    body: string,
    cc?: string[],
    bcc?: string[],
    identityId?: string,
    fromEmail?: string,
    draftId?: string,
    attachments?: Array<{ blobId: string; name: string; type: string; size: number; disposition?: 'attachment' | 'inline'; cid?: string }>,
    fromName?: string,
    htmlBody?: string
}

 export async function onBeforeDraftAutoSave(draft: AlmostSavedDraft): Promise<AlmostSavedDraft> {
  // pub key
  const key = (await getDefaultPublicCert())?.publicKey || '';
  console.log('Default public key for draft auto-save:', key);
  const modifiedDraft = JSON.parse(JSON.stringify(draft)) as AlmostSavedDraft;

  // Si aucun attachement, on retourne le draft tel quel
  if (modifiedDraft.attachments && modifiedDraft.attachments.length > 0) {

  // 1. Initialisation de la table de correspondance
  const metadataMap: Record<string, { originalName: string; originalType: string }> = {};

  // 2. Parcours et modification des pièces jointes
  modifiedDraft.attachments = modifiedDraft.attachments.map((attachement) => {
    const randomName = `${generateUUID()}`; // Exemple: "550e8400-e29b-41d4-a716-446655440000"
    
    // On sauvegarde les vraies infos en liant au blobId (ou au randomName, mais le blobId reste stable)
    metadataMap[randomName] = {
      originalName: attachement.name,
      originalType: attachement.type
    };

    // On anonymise l'attachement qui sera visible par le serveur
    return {
      ...attachement,
      name: randomName,
      type: 'application/octet-stream'
    };
  });

  // 3. Préparation du bloc JSON de métadonnées avec ses balises uniques
  const metadataJson = JSON.stringify(metadataMap);
  const metadataPayload = `\n<--PGP_METADATA_START-->${metadataJson}<--PGP_METADATA_END-->`;

  // 4. Injection à la fin du body textuel
  modifiedDraft.body = (modifiedDraft.body || '') + metadataPayload;
  }
  const encoder = new TextEncoder();
  const bodyBytes = encoder.encode(modifiedDraft.body);

  const encryptedBodyBlob = await pgpEncrypt(
      bodyBytes, 
      [], 
      key
    );
  modifiedDraft.body = await encryptedBodyBlob.text();

  if (modifiedDraft.htmlBody) {
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(modifiedDraft.htmlBody);
    
    // Appel de votre fonction pgpEncrypt
    const encryptedHtmlBlob = await pgpEncrypt(
      htmlBytes, 
      [], 
      key
    );
    
    modifiedDraft.htmlBody = await encryptedHtmlBlob.text();
  }

  return modifiedDraft;
} 

export async function onBeforeEditDraft(email: any): Promise<any> {
  console.log('Editing draft email:', email);
  // 1. Cloner l'objet pour éviter de muter l'original de manière imprévue
  const modifiedEmail = { ...email };
  const { keyRecords, unlockedKeys } = await unlockedDecryptMaps();
  console.log(keyRecords, unlockedKeys);
  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder();
  const indexText = modifiedEmail.textBody[0].partId;
  const indexHtml = modifiedEmail.htmlBody[0].partId;
  // --- DÉCHIFFREMENT DU CORPS TEXTE (Clé 1) ---
  const encryptedText = modifiedEmail.bodyValues?.[indexText]?.value;
  if (encryptedText) {
    const encryptedTextBytes = encoder.encode(encryptedText);   

    const decryptedTextResult = await pgpDecrypt({
      cmsBytes: encryptedTextBytes,
      keyRecords: keyRecords,       
      unlockedKeys: unlockedKeys,   
      knownPublicKeys: []              
    });

    let text = decoder.decode(decryptedTextResult.mimeBytes);
    console.log('Decrypted text body:', text);
    // --- RESTAURATION DES ATTACHEMENTS ---
    if (modifiedEmail.hasAttachment) {
      const metadataRegex = /<--PGP_METADATA_START-->([\s\S]*?)<--PGP_METADATA_END-->/;
      const match = text.match(metadataRegex);

      if (match && match[1]) {
        try {
          const metadataMap: Record<string, { originalName: string; originalType: string }> = JSON.parse(match[1].trim());

          // Restauration dans bodyStructure.subParts (Index >= 1)
          if (modifiedEmail.bodyStructure && Array.isArray(modifiedEmail.bodyStructure.subParts)) {
            modifiedEmail.bodyStructure.subParts = modifiedEmail.bodyStructure.subParts.map((subPart: any, index: number) => {
              if (index >= 1 && subPart.blobId) {
                const meta = metadataMap[subPart.blobId];
                if (meta) {
                  return {
                    ...subPart,
                    name: meta.originalName,
                    type: meta.originalType
                  };
                }
              }
              return subPart;
            });
          }

          // Restauration dans la liste racine des attachments
          if (Array.isArray(modifiedEmail.attachments)) {
            modifiedEmail.attachments = modifiedEmail.attachments.map((attachment: any) => {
              if (attachment.blobId && metadataMap[attachment.blobId]) {
                return {
                  ...attachment,
                  name: metadataMap[attachment.blobId].originalName,
                  type: metadataMap[attachment.blobId].originalType
                };
              }
              return attachment;
            });
          }

          // Nettoyage final du texte : suppression du JSON et de ses balises
          text = text.replace(metadataRegex, '').trim();

        } catch (e) {
          console.error("Erreur lors du parsing des métadonnées PGP :", e);
        }
      }
    }

    // Sauvegarde du texte nettoyé
    modifiedEmail.bodyValues[indexText].value = text;
  }
  console.log('Modified text after all:', modifiedEmail.bodyValues[indexText].value);

  // --- DÉCHIFFREMENT DU CORPS HTML (Clé 2) ---
  const encryptedHtml = modifiedEmail.bodyValues?.[indexHtml]?.value;
  if (encryptedHtml) {
    const encryptedHtmlBytes = encoder.encode(encryptedHtml);  
    
    const decryptedHtmlResult = await pgpDecrypt({
      cmsBytes: encryptedHtmlBytes,
      keyRecords: keyRecords,       
      unlockedKeys: unlockedKeys,   
      knownPublicKeys: []             
    });

    modifiedEmail.bodyValues[indexHtml].value = decoder.decode(decryptedHtmlResult.mimeBytes);
  }
console.log('Modified email after decryption and restoration:', modifiedEmail);
  return modifiedEmail;
}

interface Attachment {
  name: string;
  type: string;
  size: number;
  blobId: string;
}

/**
 * Main entry point for rendering PGP-processed email bodies.
 */
export async function onRenderEmailBody(body: any, ctx: any) {
  console.log(ctx, body);
  if (!ctx || !(await isCapable())) return undefined;

  await host.storage.set(VERIFY_PREFIX + ctx.id, { isEncrypted: null, processing: true });

  const detection = detectPgp(ctx.contentType, ctx.bodyStructure, ctx.bodyValues, ctx.attachments, ctx.textBody);
  if (!detection.type) return undefined;

  if (!detection.supported) {
    const status = {
      isSigned: ['pgp-signature-file', 'pgp-mime-signed'].includes(detection.type),
      isEncrypted: false,
      unsupportedReason: `Unsupported OpenPGP layout (${detection.type})`,
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

    // Contextually shared keys
    const knownPublicKeys = await loadPublicKeys(fromEmail);

    // ── Case 1 : Encrypted (And potentially signed) ──
    if (isEncryptedCase) {
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
        console.log(metadataMap);
        if (ctx.attachments) {
          console.log(ctx.attachments);
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
        console.error('Erreur lors du parsing des métadonnées PGP :', e);
      }
    }
  }
  const verif = { isEncrypted: true, decryptionSuccess: true, isSigned: false }
  await persistVerifyStatus(ctx.id, verif);

  //TODO decode and transform to dataURL
  console.log(attachments);
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

    const fallbackErrorMessage = `Could not decrypt this PGP message: ${status.decryptionError}`;
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
        verification.signatureError = `Unknown public key or missing from the keyring (Key ID: ${signerKeyID}).`;
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

  return {
    ...body,
    handledBy: 'openpgp',
    html: parsed.html || '',
    text: parsed.text || '',
    attachments: parsed.attachments,
    verification,
  };
}


// ─── Exports ───────────────────────────────────────────────────────────

export const hooks = {
  onComposeSend,
  onRenderEmailBody,
  onBeforeEditDraft,
  onBeforeDraftAutoSave,
  onBeforeBlobUpload,
  async onAfterLogout() {
    if (settings().lockOnLogout === false) return;
    try { await clearSessionKeys(); } catch (err) { host.log.warn('clearSessionKeys failed', err); }
  },
  async onAccountSwitch() {
    if (settings().lockOnLogout === false) return;
    try { await clearSessionKeys(); } catch (err) { host.log.warn('clearSessionKeys failed', err); }
  },
};

function shouldShow(extraProps: any) {
  const category = extraProps.category == null ? null : String(extraProps.category);
  return category === "authentication_security";
}


export const slots = {
  'composer-toolbar': { component: ComposerToolbar, order: 70 },
  'composer-sidebar': { component: ComposerSidebar, order: 70 },
  'email-banner': { component: EmailBanner, order: 20 },
  'settings-section': { component: SettingsSection, order: 100 },
  "email-details-section": {
    component: EmailSecuBanner,
    shouldShow,
    order: 60
  }
};

export async function activate(api :any) {
  if (!(await isCapable())) {
    api.log.error(NOT_PRIVILEGED_MSG);
    try { api.toast.error('OpenPGP needs the privileged tier — see plugin logs.'); } catch { /* ignore */ }
    return;
  }
  try { await clearSessionKeys(); } catch (err) { api.log.warn('OpenPGP: clearSessionKeys failed', err); }
  let keyCount = 0;
  try { keyCount = (await listKeyRecords()).length; } catch (err) { api.log.warn('OpenPGP: listKeyRecords failed', err); }
  api.log.info(`OpenPGP plugin activated (${keyCount} key${keyCount === 1 ? '' : 's'} available)`);
}