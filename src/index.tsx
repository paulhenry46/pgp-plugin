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
import { clearArmoredPrivateKeyToPrivateKey } from './util.ts';
import {
  saveKeyRecord, listKeyRecords, deleteKeyRecord, listPublicCerts, deletePublicCert,
  saveSessionKeys, getSessionKeys, deleteSessionKeys, clearSessionKeys, KeyRecord, PublicCert
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


export async function onRenderEmailBody(body: any, ctx: any) {
  if (!ctx) return undefined;
  if (!(await isCapable())) return undefined;
  await host.storage.set(VERIFY_PREFIX + ctx.id, { isEncrypted: null, processing: true });

  const detection = detectPgp(ctx.contentType, ctx.bodyStructure, ctx.attachments, ctx.textBody);
  if (!detection.type) return undefined;

  if (!detection.supported) {
    const status = {
      isSigned: detection.type === 'pgp-signature-file' || detection.type === 'pgp-mime-signed',
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
    console.log(raw);
    const pgpMessageContent = normalizePgpMessage(raw);

    // ── Case 1 : encrypted and meybe signed ──
    if (detection.type === 'pgp-mime-encrypted' || detection.type === 'pgp-inline-encrypted' || detection.type === 'pgp-encrypted-file') {
      const { keyRecords, unlockedKeys } = await unlockedDecryptMaps();
      
      // 1. Load the sender's public keys (or the keyring) beforehand
      const publicCerts = await listPublicCerts(fromEmail);
      const knownPublicKeys = [];
      for (const cert of publicCerts) {
        try {
          const readK = await openpgp.readKey({ armoredKey: cert.publicKey });
          knownPublicKeys.push(readK);
        } catch (e) { /* invalid key, ignore */ }
      }

      let result;
      try {
        // 2. Call pgpDecrypt while passing knownPublicKeys
        result = await pgpDecrypt({ 
          cmsBytes: new TextEncoder().encode(pgpMessageContent), 
          keyRecords, 
          unlockedKeys,
          knownPublicKeys // 💡 Transmis ici
        });
      } catch (err) {
        if (err instanceof PgpKeyLockedError) {
          const status = { isEncrypted: true, decryptionSuccess: false, decryptionError: 'locked' };
          await persistVerifyStatus(ctx.id, status);
          return {
            ...body,
            handledBy: 'openpgp',
            html: '',
            text: '',
            attachments: [],
            verification: status,
          };
        }
        const status = { isEncrypted: true, decryptionSuccess: false, decryptionError: String(err) };
        
        await persistVerifyStatus(ctx.id, status);
        return {
          ...body,
          handledBy: 'openpgp',
          html: `Could not decrypt this PGP message: ${status.decryptionError}`,
          text: `Could not decrypt this PGP message: ${status.decryptionError}`,
          attachments: [],
          verification: status,
        };
      }
      let innerBytes = result.mimeBytes;
      const verification: Verification = { isEncrypted: true, 
                            decryptionSuccess: true, 
                            isSigned: false,
                            signatureValid:false,
                            signatureError: null,
                            signerCert:null,
                          signerEmailMatch: null };
      
      // 3. Extract and validate the signature recovered during decryption
      if (result.signatures && result.signatures.length > 0) {
        console.log('result signature:',result.signatures);
        verification.isSigned = true;
        const sig = result.signatures[0];
        
        try {
          // Waiting on the promise verifies the signature mathematically
          await sig.verified; 
          verification.signatureValid = true;
          verification.signatureError = null;
          
          // Retrieve the hexadecimal ID of the signing key
          const signerKeyID = sig.keyID.toHex().toUpperCase();
          
          // Check whether we have this key's metadata for the UI
          let signingKey = knownPublicKeys.find(key => key.getKeyID().toHex().toUpperCase() === signerKeyID);
          if (signingKey) {
             const keyInfo = await extractKeyInfo(signingKey);
             verification.signerCert = {
               id: `signer-${keyInfo.fingerprint.replace(/:/g, '')}`,
               email: (keyInfo.emailAddresses[0] ?? '').toLowerCase(),
               fingerprint: keyInfo.fingerprint
             };
             verification.signerEmailMatch = fromEmail.toLowerCase().trim() === verification.signerCert.email;
             
             // Automatic import if configured
             
          } else {
             verification.signatureValid = false;
             verification.signatureError = `Unknown public key or missing from the keyring (Key ID: ${signerKeyID}).`;
          }
        } catch (sigErr) {
          verification.signatureValid = false;
          verification.signatureError = sigErr instanceof Error ? sigErr.message : String(sigErr);
        }
      }

      // 4. Continue parsing the clean internal MIME structure
      const parsed = parseMime(innerBytes);
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

    // ── Case 2: just signed ──
    if (detection.type === 'pgp-mime-signed' || detection.type === 'pgp-inline-signed' || detection.type === 'pgp-signature-file') {
      
      // TS compiles correctly because signatureBlobId is now defined in the PgpDetectionResult interface
      const signatureBlock = detection.signatureBlobId ? await host.jmap.fetchBlob(detection.signatureBlobId) : null;
      const signatureString = signatureBlock ? new TextDecoder().decode(signatureBlock) : null;

      const publicCerts = await listPublicCerts(fromEmail);
        const knownPublicKeys = [];
        for (const cert of publicCerts) {
          try {
            const readK = await openpgp.readKey({ armoredKey: cert.publicKey });
            knownPublicKeys.push(readK);
          } catch (e) { /* invalid key, ignore */ }
        }
        console.log('pub certs:' ,knownPublicKeys);
      
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


// ─── Exports ───────────────────────────────────────────────────────────

export const hooks = {
  onComposeSend,
  onRenderEmailBody,
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