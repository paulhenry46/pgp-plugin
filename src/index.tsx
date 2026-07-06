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
import React from 'react'
import * as openpgp from 'openpgp'; 
const h = React.createElement;
const { useState, useEffect, useCallback, useRef } = React;


import { buildMimeMessage, wrapAsPgpMimeEncrypted, wrapAsPgpMimeSigned } from './pgp-mime-builder.ts';
import { pgpSignDetached } from './pgp-sign.ts';
import { pgpEncrypt } from './pgp-encrypt.ts';
import { pgpVerify } from './pgp-verify.ts';
import { pgpDecrypt, normalizePgpMessage, PgpKeyLockedError } from './pgp-decrypt.ts';
import { detectPgp } from './pgp-detect.ts'; 
import { parseMime } from './mime-parse.ts';
import { extractKeyInfo, scanAndImportKeysFromAttachments } from './pgp-key-utils.ts';
import { clearArmoredPrivateKeyToPrivateKey } from './util.ts';
import {
  saveKeyRecord, listKeyRecords, deleteKeyRecord, listPublicCerts, deletePublicCert,
  saveSessionKeys, getSessionKeys, deleteSessionKeys, clearSessionKeys, KeyRecord, PublicCert
} from './key-storage.ts';

 import { importOpenPgpPrivateKey, importOpenPgpPublicKey, unlockPrivateKey } from './pgp-import.ts';

// ─── Shared preferences (api.storage; shared across iframes) ──────────

const PREFS_KEY = 'prefs.v1';
const INTENT_KEY = 'composeIntent.v1';
const VERIFY_PREFIX = 'verify:';

function settings() {
  return host.plugin?.settings || {};
}


// ─── Privileged-tier capability probe ─────────────────────────────────
const NOT_PRIVILEGED_MSG =
  'OpenPGP could not start: it is running in the restricted (untrusted) plugin ' +
  'sandbox, where in-browser cryptography and key storage are unavailable. ' +
  'This plugin must be delivered as a signed, admin-approved bundle with ' +
  '"tier": "privileged" so it loads in the same-origin tier. Contact your ' +
  'administrator.';

let _capable: boolean | null = null;
async function isCapable() {
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

// ─── Address helpers ──────────────────────────────────────────────────

function parseAddr(value: any) {
  if (value && typeof value === 'object' && value.email) {
    return { name: value.name || undefined, email: String(value.email) };
  }
  const s = String(value || '');
  const m = s.match(/^\s*(?:"?([^"<]*?)"?\s*)?<?\s*([^<>\s]+@[^<>\s]+)\s*>?\s*$/);
  if (m) return { name: (m[1] || '').trim() || undefined, email: m[2] };
  return { email: s.trim() };
}
function addrList(arr: any) {
  if (!arr) return [];
  return (Array.isArray(arr) ? arr : [arr]).map(parseAddr).filter((a) => a.email);
}
function emailsOf(input: any): string[] {
  // 1. Normalize the input as an array and filter out empty values
  const items = Array.isArray(input) ? input : [input];

  return items
    .map((item) => {
      // 2. If it is an object (e.g. { email: '...' })
      if (item && typeof item === 'object' && item.email) {
        return String(item.email);
      }
      
      // 3. If it is a string, extract what is between < > or use the raw string
      const str = String(item || '').trim();
      const match = str.match(/<([^>]+)>/);
      
      return match ? match[1] : str;
    })
    // 4. Clean the result, lowercase it, and filter invalid/empty emails
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email && email.includes('@'));
}

// ─── Blob/bytes helpers ────────────────────────────────────────────────

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}
function bytesArrayBuffer(u8: Uint8Array) {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
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
  if (!sign && !encrypt) return undefined;

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
// ─── UI: shared bits ───────────────────────────────────────────────────

const card = {
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: '8px',
  padding: '12px',
  background: 'var(--color-background, #fff)',
  color: 'var(--color-foreground, #0f172a)',
};
const btn = {
  font: 'inherit',
  padding: '6px 12px',
  borderRadius: '6px',
  border: '0px solid var(--color-input, #cbd5e1)',
  background: 'var(--color-muted, #f1f5f9)',
  color: 'var(--color-foreground, #0f172a)',
  cursor: 'pointer',
};

function fmtDate(iso: string | number | Date | null) {
  try { return iso ? new Date(iso).toLocaleDateString() : 'Never expires'; } catch { return iso; }
}
function isExpired(iso: string | number | Date | null) {
  if(!iso) return false;
  try { return iso ? new Date(iso).getTime() < Date.now() : false; } catch { return false; }
}

// ─── UI: composer toolbar (Sign / Encrypt toggles) ─────────────────────

interface PgpIntent {
  sign: boolean;
  encrypt: boolean;
}

function ComposerToolbar() {
  // Apply the generic type to state
  const [intent, setIntent] = useState<PgpIntent>({ sign: false, encrypt: false });
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!(await isCapable())) { if (alive) setReady(false); return; }
        const stored = (await host.storage.get(INTENT_KEY)) || {};
        
        if (alive) {
          setIntent({
            sign: typeof stored.sign === 'boolean' ? stored.sign : !!settings().defaultSign,
            encrypt: typeof stored.encrypt === 'boolean' ? stored.encrypt : !!settings().defaultEncrypt,
          });
        }
        const recs = await listKeyRecords();
        if (alive) setReady(recs.length > 0);
      } catch { if (alive) setReady(false); }
    })();
    return () => { alive = false; };
  }, []);

  // Explicit typing for the update parameter
  const update = useCallback(async (next: PgpIntent) => {
    setIntent(next);
    await host.storage.set(INTENT_KEY, next);
  }, []);

  // 2. Main fix: key must be a valid PgpIntent key ('sign' | 'encrypt')
  const toggle = (key: keyof PgpIntent) => update({ ...intent, [key]: !intent[key] });

  const pill = (active: boolean) => ({
    ...btn,
    background: active ? 'var(--color-accent, #25eb43)' : 'var(--color-background, #141516)',
    color: active ? '#fff' : 'var(--color-foreground, #0f172a)',
  });

  if (!ready) {
    return h('span', { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' } },
      'OpenPGP: import a key in Settings to sign/encrypt');
  }

  return h('div', { style: { display: 'inline-flex', gap: '6px', alignItems: 'center' } },

    h('style', null, `
      .composer-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.375rem;
        font-weight: 500;
        height: 2.25rem;
        padding: 0 1rem;

        cursor: pointer;
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      .composer-btn:hover {
        background-color: var(--color-accent, #2563eb) !important;

        opacity: 1 !important;
      }
    `),


    h('button', {
      type: 'button',
      style: pill(intent.sign),
      className: 'composer-btn',
      title: 'Digitally sign this message',
      onClick: () => toggle('sign'), 
    }, 
    h('svg', { 
    xmlns: 'http://www.w3.org/2000/svg', 
    height: '1rem', 
    viewBox: '0 -960 960 960', 
    width: '1rem', 
    fill: 'currentColor' 
  },
    h('path', { d: 'm438-452-58-57q-11-11-27.5-11T324-508q-11 11-11 28t11 28l86 86q12 12 28 12t28-12l170-170q12-12 11.5-28T636-592q-12-12-28.5-12.5T579-593L438-452ZM326-90l-58-98-110-24q-15-3-24-15.5t-7-27.5l11-113-75-86q-10-11-10-26t10-26l75-86-11-113q-2-15 7-27.5t24-15.5l110-24 58-98q8-13 22-17.5t28 1.5l104 44 104-44q14-6 28-1.5t22 17.5l58 98 110 24q15 3 24 15.5t7 27.5l-11 113 75 86q10 11 10 26t-10 26l-75 86 11 113q2 15-7 27.5T802-212l-110 24-58 98q-8 13-22 17.5T584-74l-104-44-104 44q-14 6-28 1.5T326-90Zm52-72 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Z' })
  )
  
  ),
    h('button', {
      type: 'button',
      style: pill(intent.encrypt),
      className: 'composer-btn',
      title: 'Encrypt this message to its recipients',
      onClick: () => toggle('encrypt'), 
    }, 
  h('svg', { 
    xmlns: 'http://www.w3.org/2000/svg', 
    height: '1rem', 
    viewBox: '0 -960 960 960', 
    width: '1rem', 
    fill: 'currentColor' // Allows the button color to be followed dynamically
  },
    h('path', { d: 'M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z' })
  )),
  );
}

// ─── UI: email banner (verification / encryption status) ───────────────

interface EmailHeaders {
  'Content-Type'?: string | string[];
  'content-type'?: string | string[];
  [key: string]: any;
}

interface EmailProps {
  email?: {
    id: string;
    headers?: EmailHeaders;
    [key: string]: any;
  };
}


interface VerificationStatus {
  isEncrypted?: boolean;
  isSigned?: boolean;
  decryptionSuccess?: boolean;
  decryptionError?: string;
  signerCert?: VerifSignerCert;
  signatureValid?: boolean;
  signerEmailMatch?: boolean;
  selfSigned?: boolean;
  signatureError?: string;
  unsupportedReason?: string;
  processing?: boolean;
}

// Type for the component's display rows
type Tone = 'ok' | 'warn' | 'error' | 'muted';
type BannerRow = [string, Tone];

function EmailBanner(props: EmailProps) {
  const email = props && props.email;
  const emailId = email?.id;

  const [status, setStatus] = useState<VerificationStatus | null>({isEncrypted: false});

  useEffect(() => {
    let alive = true;
    let intervalId: number | null = null;

    const checkStorage = async () => {
       
      if (!emailId || !alive) return;

      // Query the host's real shared storage
      const s: VerificationStatus | null = await host.storage.get(VERIFY_PREFIX + emailId);
      
      if (!alive) return;

      // If storage contains data and we are not currently recalculating (processing)
      if (s && !s.processing) {
        setStatus(s);
        console.log('s',s);
        // Stop monitoring only if the result is stable
        if (s.decryptionSuccess || (s.decryptionError && s.decryptionError !== 'locked') || s.signatureValid) {
          if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } else {
        // Visual fallback based on headers while storage is empty or still processing
        const ct = email?.headers && (email.headers['Content-Type'] || email.headers['content-type']);
        const ctStr = Array.isArray(ct) ? ct[0] : (ct as string | undefined);
        
        let fallback: VerificationStatus | null = null;
        if (ctStr && ctStr.includes('multipart/encrypted')) {
          fallback = { isEncrypted: true };
        } else if (ctStr && ctStr.includes('multipart/signed')) {
          fallback = { isSigned: true };
        }
        setStatus(fallback);
      }
    };

    // Start verification immediately on mount
    checkStorage();
    
    // Poll the RPC storage every 300ms
    intervalId = window.setInterval(checkStorage, 300);

    return () => {
      alive = false;
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [emailId]);

  if (!emailId || !status) return null;

  const rows: BannerRow[] = [];
 
  if (status.isEncrypted) {
    if (status.decryptionSuccess) rows.push([ 'Decrypted via OpenPGP', 'ok']);
    else if (status.decryptionError === 'locked') rows.push([ 'Encrypted — unlock your PGP key to read', 'warn']);
    else if (status.decryptionError) rows.push([ `Encrypted — ${status.decryptionError}`, 'error']);
    else if (status.decryptionError !== null) rows.push([ 'PGP : Processing', 'muted']);
  }
  
  if (status.isSigned || status.signerCert) {
    if (status.signatureValid) {
      const who = status.signerCert && status.signerCert.email ? ` by ${status.signerCert.email}` : '';
      const mismatch = status.signerEmailMatch === false ? ' ⚠ signer ≠ From' : '';
      const ss =  status.selfSigned ? ' (self-signed key)' : '';
      rows.push([ `PGP Signature valid${who}${ss}${mismatch}`, status.signerEmailMatch === false ? 'warn' : 'ok']);
    } else if (status.signatureError) {
      rows.push([ `PGP Signature invalid: ${status.signatureError}`, 'error']);
    } else {
      rows.push([ 'Signed OpenPGP message', 'muted']);
    }
  }

  if (rows.length === 0) return null;

  const toneColor = (tone: Tone): string => 
    tone === 'ok' ? 'var(--color-success, #16a34a)'
    : tone === 'error' ? 'var(--color-destructive, #dc2626)'
      : tone === 'warn' ? 'var(--color-warning, #d97706)'
        : 'var(--color-muted-foreground, #64748b)';

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
    rows.map(([ text, tone], i) =>
      h('div', {
        key: i,
        style: {
          display: 'flex', gap: '8px', alignItems: 'center',
          padding: '6px 10px', fontSize: '13px',
          border: `1px solid ${toneColor(tone)}`,
          color: toneColor(tone),
        },
      },  h('span', null, text)),
    ),
  );
}

function EmailSecuBanner(props: EmailProps) {
  const email = props && props.email;
  const emailId = email?.id;

  const [status, setStatus] = useState<VerificationStatus | null>({isEncrypted: false});

  useEffect(() => {
    let alive = true;
    let intervalId: number | null = null;

    const checkStorage = async () => {
      if (!emailId || !alive) return;

      const s: VerificationStatus | null = await host.storage.get(VERIFY_PREFIX + emailId);
      
      if (!alive) return;

      if (s && !s.processing) {
        setStatus(s);
        console.log('s', s);
        if (s.decryptionSuccess || (s.decryptionError && s.decryptionError !== 'locked') || s.signatureValid) {
          if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } else {
        const ct = email?.headers && (email.headers['Content-Type'] || email.headers['content-type']);
        const ctStr = Array.isArray(ct) ? ct[0] : (ct as string | undefined);
        
        let fallback: VerificationStatus | null = null;
        if (ctStr && ctStr.includes('multipart/encrypted')) {
          fallback = { isEncrypted: true };
        } else if (ctStr && ctStr.includes('multipart/signed')) {
          fallback = { isSigned: true };
        }
        setStatus(fallback);
      }
    };

    checkStorage();
    intervalId = window.setInterval(checkStorage, 300);

    return () => {
      alive = false;
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [emailId]);

  if (!emailId || !status) return null;



  const isEncrypted = !!status.isEncrypted;
  const isSigned = !!(status.isSigned || status.signerCert);
  const hasSignatureError = !!status.signatureError;

  // If the message is neither encrypted nor signed, render nothing
  if (!isEncrypted && !isSigned) return null;

  // Define the required SVGs
  const svgEncrypted = h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '24px', viewBox: '0 -960 960 960', width: '24px', fill: 'currentColor', style: { width: '16px', height: '16px' } }, 
    h('path', { d: 'M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z' })
  );

  const svgSigned = h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '24px', viewBox: '0 -960 960 960', width: '24px', fill: 'currentColor', style: { width: '16px', height: '16px' } }, 
    h('path', { d: 'm438-452-58-57q-11-11-27.5-11T324-508q-11 11-11 28t11 28l86 86q12 12 28 12t28-12l170-170q12-12 11.5-28T636-592q-12-12-28.5-12.5T579-593L438-452ZM326-90l-58-98-110-24q-15-3-24-15.5t-7-27.5l11-113-75-86q-10-11-10-26t10-26l75-86-11-113q-2-15 7-27.5t24-15.5l110-24 58-98q8-13 22-17.5t28 1.5l104 44 104-44q14-6 28-1.5t22 17.5l58 98 110 24q15 3 24 15.5t7 27.5l-11 113 75 86q10 11 10 26t-10 26l-75 86 11 113q2 15-7 27.5T802-212l-110 24-58 98q-8 13-22 17.5T584-74l-104-44-104 44q-14 6-28 1.5T326-90Zm52-72 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Z' })
  );

  const svgError = h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '24px', viewBox: '0 -960 960 960', width: '24px', fill: 'currentColor', style: { width: '16px', height: '16px' } }, 
    h('path', { d: 'M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5Zm0-160Q520-463 520-480v-160q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640v160q0 17 11.5 28.5T480-440q17 0 28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z' })
  );

  // Determine the label and color based on the overall verdict
  let label = '';
  let color = 'var(--color-foreground, #64748b)'; // Default
  let bgcolor = 'var(--color-muted, rgba(100,116,139,0.06))'; // Default
  const icons: any[] = [];

  if (isEncrypted && isSigned) {
    label = 'Encrypted et signed';
    color = hasSignatureError ? 'var(--color-destructive, #dc2626)' : 'var(--color-success, #16a34a)';
    bgcolor = hasSignatureError ? 'var(--color-red-950, #dc2626)' : 'var(--color-green-950, #0b2e17)';
    icons.push(svgEncrypted, hasSignatureError ? svgError : svgSigned);
  } else if (isEncrypted) {
    label = 'Encrypted';
    color = 'var(--color-success, #16a34a)';
    bgcolor = 'var(--color-green-950, #0b2e17)';
    icons.push(svgEncrypted);
  } else if (isSigned) {
    label = 'Signed';
    color = hasSignatureError ? 'var(--color-destructive, #dc2626)' : 'var(--color-success, #16a34a)';
    bgcolor = hasSignatureError ? 'var(--color-red-950, #dc2626)' : 'var(--color-green-950, #0b2e17)';
    icons.push(hasSignatureError ? svgError : svgSigned);
  }


  return h('div', { style: { display: 'flex', gap: '6px', padding: '6px 0' } },
  h('span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        'padding-left': '0.5rem',
        'padding-right': '0.5rem',
        'padding-top': '0.25rem',
        'padding-bottom': '0.25rem',
        'border-radius': '0.375rem',
        'border-width': '1px',
        'font-size': '0.75rem',
        'line-height': '1rem',
        
        'border-color': color,
        'border-style': 'solid',
      }
    },
    h('span',
      {
        style: {
          'color': color,
          'display': 'inline-flex', 
        }
      },
      // Loop over the icons to apply margin-left only to the second one
      icons.map((icon, index) => {
        if (index === 1) {

          return h('span', { key: index, style: { 'margin-left': '0.25rem', 'display': 'inline-flex' } }, icon);
        }
        return icon;
      })
    ),
    label
  )
);
}

// ─── UI: settings section (key management) ─────────────────────────────


function SettingsSection() {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [certs, setCerts] = useState<PublicCert[]>([]); 
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<boolean>(false);
  const [capable, setCapable] = useState<boolean>(true);
  const [unlockingKeyId, setUnlockingKeyId] = useState<string | null>(null);
  const [unlockPassphrase, setUnlockPassphrase] = useState<string>('');
  

  const [hasPrivateFile, setHasPrivateFile] = useState<boolean>(false);
  const [passphrase, setPassphrase] = useState<string>('');
  
  const fileRef = useRef<HTMLInputElement | null>(null);
  const certFileRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    if (!(await isCapable())) { setCapable(false); return; }
    const [k, c] = await Promise.all([listKeyRecords(), listPublicCerts()]);
    setKeys(k); setCerts(c);
    
    const u: Record<string, boolean> = {};
    for (const rec of k) {
      u[rec.id] = !!(await getSessionKeys(rec.id));
    }
    setUnlocked(u);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  if (!capable) {
    return h('div', { style: { ...card, borderColor: 'var(--color-destructive, #dc2626)', color: 'var(--color-destructive, #dc2626)', maxWidth: '720px' } },
      h('div', { style: { fontWeight: 600, marginBottom: '6px' } }, 'OpenPGP is not active'),
      h('div', { style: { fontSize: '13px', lineHeight: 1.5 } }, NOT_PRIVILEGED_MSG),
    );
  }

  // Detect when the user selects or removes a private file
  function handleFileChange() {
    const file = fileRef.current && fileRef.current.files && fileRef.current.files[0];
    setHasPrivateFile(!!file);
  }

  async function importKeyFile() {
    const file = fileRef.current && fileRef.current.files && fileRef.current.files[0];
    if (!file) return;
    
    if (!passphrase.trim()) {
      host.toast.error('Please enter the OpenPGP passphrase to decrypt this private key.');
      return;
    }
    
    setBusy(true);
    try {
      const text = new TextDecoder().decode(await file.arrayBuffer());
     
      const { keyRecord } = await importOpenPgpPrivateKey(text, passphrase, passphrase);
      
      await saveKeyRecord(keyRecord);
      host.toast.success(`Imported OpenPGP key for ${keyRecord.email || 'identity'}`);
      

      if (fileRef.current) fileRef.current.value = '';
      setHasPrivateFile(false);
      setPassphrase('');
      
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(`Import failed: ${error?.message ? error.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  function initiateUnlock(rec: KeyRecord) {
  setUnlockingKeyId(rec.id);
  setUnlockPassphrase('');
  }

  async function confirmUnlock(rec: KeyRecord) {
    if (!unlockPassphrase.trim()) {
      host.toast.error('Please enter your passphrase.');
      return;
    }
    setBusy(true);
    try {
      const { unlockedPrivateKey, signingKey, decryptionKey } = await unlockPrivateKey(rec, unlockPassphrase);
      
      await saveSessionKeys({ 
        id: rec.id, 
        unlockedPrivateKey, 
        signingKey, 
        decryptionKey 
      });
      
      host.toast.success(`Unlocked ${rec.email || 'key'}`);
      setUnlockingKeyId(null);
      setUnlockPassphrase('');
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(error?.message ? error.message : 'Unlock failed');
    } finally {
      setBusy(false);
    }
  }

  async function lock(rec: KeyRecord) {
    await deleteSessionKeys(rec.id);
    host.toast.info(`Locked ${rec.email || 'key'}`);
    await refresh();
  }

  async function removeKey(rec: KeyRecord) {
    const ok = await host.ui.confirm({
      title: 'Delete OpenPGP key',
      message: `Delete the private key and public identity for ${rec.email || 'this identity'}? You will no longer be able to decrypt mail encrypted to it.`,
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    await deleteSessionKeys(rec.id);
    await deleteKeyRecord(rec.id);
    host.toast.success('Key deleted');
    await refresh();
  }

  async function importCertFile() {
    const file = certFileRef.current && certFileRef.current.files && certFileRef.current.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = new TextDecoder().decode(await file.arrayBuffer());
      const email = await importOpenPgpPublicKey(text);
      host.toast.success(`Imported public key for ${email}`);
      if (certFileRef.current) certFileRef.current.value = '';
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(`Key import failed: ${error?.message ? error.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function removeCert(c: PublicCert) {
    await deletePublicCert(c.id);
    await refresh();
  }


  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' } },
  h('div', null,
    h('h3', { style: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600 } }, 'Your OpenPGP keys'),
    h('p', { style: { margin: '0 0 8px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } },
      'Import an armored OpenPGP private key (.asc/.key). The key remains encrypted locally in your browser sandbox.'),
    
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' } },
      h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
        h('input', { 
          ref: fileRef, 
          type: 'file', 
          accept: '.asc,.key,.pgp', 
          style: { fontSize: '13px' },
          onChange: handleFileChange 
        }),
        h('button', { type: 'button', style: btn, disabled: busy, onClick: importKeyFile }, 'Import private key')
      ),
      
      hasPrivateFile && h('input', {
        type: 'password',
        placeholder: 'Enter OpenPGP key passphrase...',
        value: passphrase,
        disabled: busy,
        onChange: (e) => setPassphrase(e.target.value),
        style: {
          padding: '6px 10px',
          fontSize: '13px',
          borderRadius: '4px',
          border: '1px solid var(--color-border, #e2e8f0)',
          maxWidth: '320px',
          marginTop: '4px'
        }
      })
    ),

    keys.length === 0
      ? h('div', { style: { ...card, fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } }, 'No keys imported yet.')
      : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        keys.map((rec) => h('div', { key: rec.id, style: { ...card, display: 'flex', flexDirection: 'column', gap: '10px' } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' } },
            h('div', null,
              h('div', { style: { fontWeight: 600, fontSize: '14px' } }, rec.email || rec.subject || 'OpenPGP User'),
              h('div', { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' } },
                `${rec.algorithm} · created ${fmtDate(rec.notBefore)}${rec.notAfter ? ` · expires ${fmtDate(rec.notAfter)}` : ' · no expiration'}${isExpired(rec.notAfter) ? ' · EXPIRED' : ''}`),
              h('div', { style: { fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-muted-foreground, #64748b)', wordBreak: 'break-all' } },
                rec.fingerprint),
              h('div', { style: { fontSize: '11px', color: 'var(--color-muted-foreground, #64748b)' } },
                `${rec.capabilities && rec.capabilities.canSign ? 'sign' : ''}${rec.capabilities && rec.capabilities.canSign && rec.capabilities.canEncrypt ? ' · ' : ''}${rec.capabilities && rec.capabilities.canEncrypt ? 'encrypt' : ''}`),
            ),
            h('div', { style: { display: 'flex', gap: '6px', alignItems: 'flex-start' } },
              unlocked[rec.id]
                ? h('button', { type: 'button', style: btn, disabled: busy, onClick: () => lock(rec) }, 'Lock')
                : h('button', { type: 'button', style: btn, disabled: busy, onClick: () => initiateUnlock(rec) }, 'Unlock'),
              h('button', {
                type: 'button',
                style: { ...btn, color: 'var(--color-destructive, #dc2626)', borderColor: 'var(--color-destructive, #dc2626)' },
                disabled: busy, onClick: () => removeKey(rec),
              }, 'Delete'),
            ),
          ),
          
          // Conditionally insert the input block BELOW the relevant key details
          unlockingKeyId === rec.id && h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', borderTop: '1px dashed var(--color-border, #e2e8f0)', paddingTop: '8px' } },
            h('input', {
              type: 'password',
              placeholder: 'Enter passphrase to unlock...',
              value: unlockPassphrase,
              disabled: busy,
              onChange: (e) => setUnlockPassphrase(e.target.value),
              style: {
                padding: '4px 8px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #e2e8f0)',
                flex: 1,
                maxWidth: '240px'
              }
            }),
            h('button', { type: 'button', style: btn, disabled: busy, onClick: () => confirmUnlock(rec) }, 'OK'),
            h('button', { type: 'button', style: btn, disabled: busy, onClick: () => setUnlockingKeyId(null) }, 'Cancel')
          )
        )),
      ),
  ),

    h('div', null,
      h('h3', { style: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600 } }, 'Recipient public keys'),
      h('p', { style: { margin: '0 0 8px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } },
        'Public keys (ASCII Armored) of contacts you send encrypted mail to. Signer keys extracted from valid signed messages are verified and captured automatically.'),
      h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' } },
        h('input', { ref: certFileRef, type: 'file', accept: '.asc,.key,.pub', style: { fontSize: '13px' } }),
        h('button', { type: 'button', style: btn, disabled: busy, onClick: importCertFile }, 'Import public key'),
      ),
      certs.length === 0
        ? h('div', { style: { ...card, fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } }, 'No recipient public keys collected.')
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          certs.map((c) => h('div', { key: c.id, style: { ...card, display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' } },
            h('div', null,
              h('div', { style: { fontWeight: 600, fontSize: '13px' } }, c.email || c.subject),
              h('div', { style: { fontSize: '11px', color: 'var(--color-muted-foreground, #64748b)' } },
                `${c.source} · expires ${fmtDate(c.notAfter)}${isExpired(c.notAfter) ? ' · EXPIRED' : ''}`),
            ),
            h('button', { type: 'button', style: { ...btn, color: 'var(--color-destructive, #dc2626)' }, onClick: () => removeCert(c) }, 'Remove'),
          )),
        ),
    ),
  );
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