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
const h = React.createElement;
const { useState, useEffect, useCallback, useRef } = React;

// Importations des nouveaux modules OpenPGP & Mimetext
import { buildMimeMessage, wrapAsPgpMimeEncrypted, wrapAsPgpMimeSigned } from './pgp-mime-builder.ts';
import { pgpSignDetached, pgpSignInline } from './pgp-sign.ts';
import { pgpEncrypt } from './pgp-encrypt.ts';
import { pgpVerify } from './pgp-verify.ts';
import { pgpDecrypt, normalizePgpMessage, PgpKeyLockedError } from './pgp-decrypt.ts';
import { detectPgp } from './pgp-detect.ts'; // Remplacement de detectSmime
import { parseMime } from './mime-parse.ts';
import { extractKeyInfo } from './pgp-key-utils.ts';
import { generateUUID } from './util.ts';
import {
  saveKeyRecord, listKeyRecords, deleteKeyRecord,
  savePublicCert, listPublicCerts, deletePublicCert,
  saveSessionKeys, getSessionKeys, deleteSessionKeys, clearSessionKeys, KeyRecord, PublicCert
} from './key-storage.ts';

 import { importOpenPgpPrivateKey, unlockPrivateKey } from './pgp-import.ts';

// ─── Shared preferences (api.storage; shared across iframes) ──────────

const PREFS_KEY = 'prefs.v1';
const INTENT_KEY = 'composeIntent.v1';
const VERIFY_PREFIX = 'verify:';

const DEFAULT_PREFS = { defaultSign: false, defaultEncrypt: false };

async function getPrefs() {
  try {
    const p = await host.storage.get(PREFS_KEY);
    return { ...DEFAULT_PREFS, ...(p || {}) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}
async function setPrefs(next: any) {
  await host.storage.set(PREFS_KEY, next);
}

function settings() {
  return host.plugin?.settings || {};
}
function useAes128() {
  return settings().encryptionStrength === 'aes-128';
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
function emailsOf(arr: any) {
  return addrList(arr).map((a) => a.email.toLowerCase());
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

// Construit la carte des clés privées déverrouillées depuis le store de session.
async function unlockedDecryptMaps() {
  const recs = await listKeyRecords();
  const unlockedKeys = new Map();
  for (const r of recs) {
    const s = await getSessionKeys(r.id);
    if (!s) continue;
    // OpenPGP unifie la clé de déchiffrement (plus besoin de clé legacy)
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
    const prefs = await getPrefs();
    sign = typeof stored.sign === 'boolean' ? stored.sign : prefs.defaultSign;
    encrypt = typeof stored.encrypt === 'boolean' ? stored.encrypt : prefs.defaultEncrypt;
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
  messageId?: string; // Utilisé par les wrappers PGP/MIME
  text?: string;      // Fallback
  html?: string;      // Fallback
}

export async function onComposeSend(req: ComposeRequest): Promise<boolean | undefined> {
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

    const from = parseAddr(req.fromEmail || req.from || (addrList(req.from)[0] || {}).email || '');
    if (!from.email) throw new Error('Could not determine sender address');

    const to = addrList(req.to);
    const cc = addrList(req.cc);
    const bcc = addrList(req.bcc);
    const allRecipientEmails = [...emailsOf(req.to), ...emailsOf(req.cc), ...emailsOf(req.bcc)];

    // Initialisation typée
    let keyRecord: KeyRecord | undefined = undefined;
    if (sign || encrypt) {
      keyRecord = await signingKeyRecordForEmail(from.email);
    }

    if ((sign || encrypt) && !keyRecord) {
      host.toast.error(`No OpenPGP key for ${from.email}. Import one in Settings → Plugins → OpenPGP.`);
      return false;
    }

    // 1. Génération de la structure MIME claire (avec mimetext)
    const attachments = await fetchAttachments(req);
    const clearMimeBytes = buildMimeMessage({
      from,
      to,
      cc,
      subject: req.subject || '',
      textBody: req.textBody || req.text || '',
      htmlBody: req.htmlBody || req.html || '',
      inReplyTo: req.inReplyTo,
      references: req.references,
      attachments,
    });

    let finalEnvelopeBlob: Blob | undefined;
    
    // À ce stade, TypeScript sait que si (sign || encrypt) est vrai, keyRecord est défini
    // Mais pour satisfaire l'analyseur strict, on ajoute une assertion ou une garde locale
    const currentKeyRecord = keyRecord as KeyRecord;
    const session = await getSessionKeys(currentKeyRecord.id);

    // 2. Traitement des combinaisons Cryptographiques (Sign, Encrypt, ou Sign+Encrypt)
    if (encrypt) {
      // Résolution des clés destinataires
      const { found, missing } = await recipientKeysFor(allRecipientEmails);
      if (missing.length > 0) {
        host.toast.error(`Missing encryption key for: ${missing.join(', ')}`);
        return false;
      }

      let payloadToEncrypt = clearMimeBytes;

      // Si Signature + Chiffrement, on effectue un chiffrement de la structure signée (Sign-then-Encrypt)
      if (sign) {
        if (!session || !session.signingKey) {
          host.toast.error('Your OpenPGP key is locked. Unlock it in Settings, then resend.');
          return false;
        }
        // En PGP/MIME chiffré, on privilégie la signature Inline intégrée au bloc chiffré pour maximiser la compatibilité
        payloadToEncrypt = await pgpSignInline(clearMimeBytes, session.signingKey);
      }

      // Chiffrement global
      const encryptedBlob = await pgpEncrypt(payloadToEncrypt, found, currentKeyRecord.publicKey, useAes128());
      
      // Encapsulation au standard strict PGP/MIME multipart/encrypted (RFC 3156)
      finalEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedBlob, {
        from, to, cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId: req.messageId
      });

    } else if (sign) {
      // Cas : Signature uniquement (multipart/signed détachée)
      if (!session || !session.signingKey) {
        host.toast.error('Your OpenPGP key is locked. Unlock it in Settings, then resend.');
        return false;
      }
      const signatureBlob = await pgpSignDetached(clearMimeBytes, session.signingKey);
      
    //convert clearMimeBytes to blob
    const clearMimeBytesBlob = new Blob([clearMimeBytes.slice().buffer], { type: 'application/octet-stream' });

      finalEnvelopeBlob = wrapAsPgpMimeSigned(clearMimeBytesBlob, signatureBlob, {
        from, to, cc, subject: req.subject || '', inReplyTo: req.inReplyTo, references: req.references, messageId: req.messageId
      });
    }

    if (!finalEnvelopeBlob) {
      throw new Error('Cryptographic processing failed to generate an output envelope.');
    }

    // 3. Extraction et soumission brute au serveur JMAP
    const rawBytes = await blobToBytes(finalEnvelopeBlob);
    const envelopeRecipients = [...new Set([...allRecipientEmails])];
    await host.jmap.sendRaw(bytesArrayBuffer(rawBytes), identityId, { envelopeRecipients });

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

async function maybeAutoImportSigner(status:any) {
  if (settings().autoImportSignerCerts === false) return;
  const cert = status && status.signerCert; // On garde .signerCert pour la compatibilité sémantique de l'UI
  if (!cert || !status.signatureValid || !cert.email) return;
  try {
    const existing = (await listPublicCerts()).some((c) => c.fingerprint === cert.fingerprint);
    if (!existing) {
      await savePublicCert({
        id: generateUUID(),
        email: cert.email,
        publicKey: cert.publicKey,
        issuer: cert.issuer,
        subject: cert.subject,
        notBefore: cert.notBefore,
        notAfter: cert.notAfter,
        fingerprint: cert.fingerprint,
        source: 'signed-email',
      });
    }
  } catch (err) {
    host.log.warn('auto-import signer key failed', err);
  }
}

function statusNoticeHtml(message: string, tone: string) {
  const color = tone === 'error' ? 'var(--color-destructive, #dc2626)'
    : tone === 'ok' ? 'var(--color-success, #16a34a)'
      : 'var(--color-muted-foreground, #64748b)';
  return `<div style="padding:12px;border:1px solid ${color};border-radius:8px;color:${color};font-size:14px;">${message}</div>`;
}

async function persistVerifyStatus(emailId: string, status: any) {
  if (!emailId) return;
  try { await host.storage.set(VERIFY_PREFIX + emailId, status); } catch { /* ignore */ }
}

export async function onRenderEmailBody(body: any, ctx: any) {
  if (!ctx) return undefined;
  if (!(await isCapable())) return undefined;

  // Détection OpenPGP
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

    // ── Cas 1 : Traitement du Payload Chiffré (Vérification harmonisée) ──
    if (detection.type === 'pgp-mime-encrypted' || detection.type === 'pgp-inline-encrypted' || detection.type === 'pgp-encrypted-file') {
      const { keyRecords, unlockedKeys } = await unlockedDecryptMaps();
      let result;
      try {
        result = await pgpDecrypt({ cmsBytes: new TextEncoder().encode(pgpMessageContent), keyRecords, unlockedKeys });
      } catch (err) {
        if (err instanceof PgpKeyLockedError) {
          const status = { isEncrypted: true, decryptionSuccess: false, decryptionError: 'locked' };
          await persistVerifyStatus(ctx.id, status);
          return {
            ...body,
            handledBy: 'openpgp',
            html: statusNoticeHtml('🔒 This message is encrypted. Unlock your OpenPGP key in Settings to read it.', 'muted'),
            text: 'This message is encrypted. Unlock your OpenPGP key to read it.',
            attachments: [],
            verification: status,
          };
        }
        const status = { isEncrypted: true, decryptionSuccess: false, decryptionError: String(err) };
        await persistVerifyStatus(ctx.id, status);
        return {
          ...body,
          handledBy: 'openpgp',
          html: statusNoticeHtml(`🔒 Could not decrypt this PGP message: ${status.decryptionError}`, 'error'),
          text: `Could not decrypt this PGP message: ${status.decryptionError}`,
          attachments: [],
          verification: status,
        };
      }

      let innerBytes = result.mimeBytes;
      const verification = { isEncrypted: true, decryptionSuccess: true };
      
      try {
        const v = await pgpVerify(innerBytes, fromEmail);
        if (v.status && v.status.signatureValid) {
          innerBytes = v.mimeBytes;
          Object.assign(verification, v.status, { isEncrypted: true, decryptionSuccess: true });
          await maybeAutoImportSigner(v.status);
        }
      } catch { /* Uniquement chiffré */ }

      const parsed = parseMime(innerBytes);
      await persistVerifyStatus(ctx.id, verification);
      return {
        ...body,
        handledBy: 'openpgp',
        html: parsed.html || '',
        text: parsed.text || '',
        attachments: parsed.attachments,
        verification,
      };
    }

    // ── Cas 2 : Traitement du Payload Signé (Vérification harmonisée) ──
    if (detection.type === 'pgp-mime-signed' || detection.type === 'pgp-inline-signed' || detection.type === 'pgp-signature-file') {
      
      // TS compile correctement car signatureBlobId est désormais défini dans l'interface PgpDetectionResult
      const signatureBlock = detection.signatureBlobId ? await host.jmap.fetchBlob(detection.signatureBlobId) : null;
      const signatureString = signatureBlock ? new TextDecoder().decode(signatureBlock) : null;

      const v = await pgpVerify(new TextEncoder().encode(pgpMessageContent), fromEmail, signatureString);
      await maybeAutoImportSigner(v.status);
      
      const parsed = parseMime(v.mimeBytes);
      await persistVerifyStatus(ctx.id, v.status);
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
  background: 'var(--color-card, #fff)',
  color: 'var(--color-foreground, #0f172a)',
};
const btn = {
  font: 'inherit',
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid var(--color-input, #cbd5e1)',
  background: 'var(--color-muted, #f1f5f9)',
  color: 'var(--color-foreground, #0f172a)',
  cursor: 'pointer',
};
const btnPrimary = { ...btn, background: 'var(--color-primary, #2563eb)', color: '#fff', border: '1px solid var(--color-primary, #2563eb)' };
const inputStyle = { // Renommé pour éviter les collisions sémantiques avec l'élément <input>
  font: 'inherit',
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid var(--color-input, #cbd5e1)',
  background: 'var(--color-background, #fff)',
  color: 'var(--color-foreground, #0f172a)',
  width: '100%',
  boxSizing: 'border-box',
};

function fmtDate(iso: string | number | Date | null) {
  try { return iso ? new Date(iso).toLocaleDateString() : 'Never expires'; } catch { return iso; }
}
function isExpired(iso: string | number | Date | null) {
  if(!iso) return false;
  try { return iso ? new Date(iso).getTime() < Date.now() : false; } catch { return false; }
}

// ─── UI: composer toolbar (Sign / Encrypt toggles) ─────────────────────

// 1. Définition de l'interface pour l'état d'intention
interface PgpIntent {
  sign: boolean;
  encrypt: boolean;
}

function ComposerToolbar() {
  // Application du type générique à l'état
  const [intent, setIntent] = useState<PgpIntent>({ sign: false, encrypt: false });
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!(await isCapable())) { if (alive) setReady(false); return; }
        const stored = (await host.storage.get(INTENT_KEY)) || {};
        const prefs = await getPrefs();
        if (alive) {
          setIntent({
            sign: typeof stored.sign === 'boolean' ? stored.sign : !!prefs.defaultSign,
            encrypt: typeof stored.encrypt === 'boolean' ? stored.encrypt : !!prefs.defaultEncrypt,
          });
        }
        const recs = await listKeyRecords();
        if (alive) setReady(recs.length > 0);
      } catch { if (alive) setReady(false); }
    })();
    return () => { alive = false; };
  }, []);

  // Typage explicite du paramètre de mise à jour
  const update = useCallback(async (next: PgpIntent) => {
    setIntent(next);
    await host.storage.set(INTENT_KEY, next);
  }, []);

  // 2. Correction principale : key doit être une clé valide de PgpIntent ('sign' | 'encrypt')
  const toggle = (key: keyof PgpIntent) => update({ ...intent, [key]: !intent[key] });

  const pill = (active: boolean) => ({
    ...btn,
    background: active ? 'var(--color-primary, #2563eb)' : 'var(--color-muted, #f1f5f9)',
    color: active ? '#fff' : 'var(--color-foreground, #0f172a)',
    border: active ? '1px solid var(--color-primary, #2563eb)' : '1px solid var(--color-input, #cbd5e1)',
  });

  if (!ready) {
    return h('span', { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' } },
      'OpenPGP: import a key in Settings to sign/encrypt');
  }

  return h('div', { style: { display: 'inline-flex', gap: '6px', alignItems: 'center' } },
    h('button', {
      type: 'button',
      style: pill(intent.sign),
      title: 'Digitally sign this message',
      onClick: () => toggle('sign'), // Validé par TypeScript
    }, intent.sign ? '✓ Sign' : 'Sign'),
    h('button', {
      type: 'button',
      style: pill(intent.encrypt),
      title: 'Encrypt this message to its recipients',
      onClick: () => toggle('encrypt'), // Validé par TypeScript
    }, intent.encrypt ? '✓ Encrypt' : 'Encrypt'),
  );
}

// ─── UI: email banner (verification / encryption status) ───────────────

// --- Déclaration des types et interfaces ---
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

interface SignerCert {
  email?: string;
  [key: string]: any;
}

interface VerificationStatus {
  isEncrypted?: boolean;
  isSigned?: boolean;
  decryptionSuccess?: boolean;
  decryptionError?: string;
  signerCert?: SignerCert;
  signatureValid?: boolean;
  signerEmailMatch?: boolean;
  selfSigned?: boolean;
  signatureError?: string;
  unsupportedReason?: string;
}

// Type pour les lignes d'affichage du composant
type Tone = 'ok' | 'warn' | 'error' | 'muted';
type BannerRow = [string, string, Tone];

function EmailBanner(props: EmailProps) {
  const email = props && props.email;
  
  // Correction ici : typage explicite de l'état avec l'interface VerificationStatus
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!email || !email.id) { setLoaded(true); return; }
      
      let s: VerificationStatus | null = await host.storage.get(VERIFY_PREFIX + email.id);
      
      if (!s) {
        // Détection à la volée via les en-têtes si le hook de rendu n'a pas encore fini
        const ct = email.headers && (email.headers['Content-Type'] || email.headers['content-type']);
        const ctStr = Array.isArray(ct) ? ct[0] : (ct as string | undefined);
        
        // Simulation minimale de détection basée sur les structures de détection OpenPGP
        if (ctStr && ctStr.includes('multipart/encrypted')) {
          s = { isEncrypted: true };
        } else if (ctStr && ctStr.includes('multipart/signed')) {
          s = { isSigned: true };
        }
      }
      
      if (alive) { 
        setStatus(s || null); 
        setLoaded(true); 
      }
    })();
    
    return () => { alive = false; };
  }, [email && email.id]);

  if (!loaded || !status) return null;

  // Typage strict du tableau de lignes
  const rows: BannerRow[] = [];
  const warnSelfSigned = settings().warnOnSelfSigned !== false;

  if (status.isEncrypted) {
    if (status.decryptionSuccess) rows.push(['🔓', 'Decrypted via OpenPGP', 'ok']);
    else if (status.decryptionError === 'locked') rows.push(['🔒', 'Encrypted — unlock your PGP key to read', 'warn']);
    else if (status.decryptionError) rows.push(['🔒', `Encrypted — ${status.decryptionError}`, 'error']);
    else rows.push(['🔒', 'Encrypted OpenPGP message', 'muted']);
  }
  
  if (status.isSigned || status.signerCert) {
    if (status.signatureValid) {
      const who = status.signerCert && status.signerCert.email ? ` by ${status.signerCert.email}` : '';
      const mismatch = status.signerEmailMatch === false ? ' ⚠ signer ≠ From' : '';
      const ss = warnSelfSigned && status.selfSigned ? ' (self-signed key)' : '';
      rows.push(['🛡️', `PGP Signature valid${who}${ss}${mismatch}`, status.signerEmailMatch === false ? 'warn' : 'ok']);
    } else if (status.signatureError) {
      rows.push(['⚠️', `PGP Signature invalid: ${status.signatureError}`, 'error']);
    } else {
      rows.push(['✍️', 'Signed OpenPGP message', 'muted']);
    }
  }
  if (status.unsupportedReason) rows.push(['ℹ️', status.unsupportedReason, 'muted']);

  if (rows.length === 0) return null;

  // Typage de l'argument de toneColor
  const toneColor = (tone: Tone): string => 
    tone === 'ok' ? 'var(--color-success, #16a34a)'
    : tone === 'error' ? 'var(--color-destructive, #dc2626)'
      : tone === 'warn' ? 'var(--color-warning, #d97706)'
        : 'var(--color-muted-foreground, #64748b)';

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0' } },
    rows.map(([icon, text, tone], i) =>
      h('div', {
        key: i,
        style: {
          display: 'flex', gap: '8px', alignItems: 'center',
          padding: '6px 10px', borderRadius: '6px', fontSize: '13px',
          border: `1px solid ${toneColor(tone)}`,
          color: toneColor(tone),
          background: 'var(--color-muted, rgba(100,116,139,0.06))',
        },
      }, h('span', null, icon), h('span', null, text)),
    ),
  );
}

// ─── UI: settings section (key management) ─────────────────────────────

interface Prefs {
  defaultSign?: boolean;
  defaultEncrypt?: boolean;
  [key: string]: any;
}

function SettingsSection() {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [certs, setCerts] = useState<PublicCert[]>([]); 
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<boolean>(false);
  const [capable, setCapable] = useState<boolean>(true);
  const [unlockingKeyId, setUnlockingKeyId] = useState<string | null>(null);
  const [unlockPassphrase, setUnlockPassphrase] = useState<string>('');
  
  // Nouveaux états pour gérer le fichier sélectionné et sa passphrase
  const [hasPrivateFile, setHasPrivateFile] = useState<boolean>(false);
  const [passphrase, setPassphrase] = useState<string>('');
  
  const fileRef = useRef<HTMLInputElement | null>(null);
  const certFileRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    if (!(await isCapable())) { setCapable(false); return; }
    const [k, c, p] = await Promise.all([listKeyRecords(), listPublicCerts(), getPrefs()]);
    setKeys(k); setCerts(c); setPrefsState(p);
    
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

  // Détecte quand l'utilisateur choisit ou retire un fichier privé
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
      
      // Reset de l'interface d'import après succès
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
      const openpgp = await import('openpgp');
      const readKey = await openpgp.readKey({ armoredKey: text });
      const info = await extractKeyInfo(readKey);
      
      const email = (info.emailAddresses[0] || '').toLowerCase();
      if (!email) throw new Error('Key has no valid email address associated');
      
      await savePublicCert({
        id: generateUUID(),
        email,
        publicKey: text,
        issuer: info.issuer,
        subject: info.subject,
        notBefore: info.notBefore,
        notAfter: info.notAfter,
        fingerprint: info.fingerprint,
        source: 'manual',
      });
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

  async function setPref(key: keyof Prefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefsState(next);
    await setPrefs(next);
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
                ? h('button', { type: 'button', style: btn, disabled: busy, onClick: () => lock(rec) }, '🔓 Lock')
                : h('button', { type: 'button', style: btnPrimary, disabled: busy, onClick: () => initiateUnlock(rec) }, '🔒 Unlock'),
              h('button', {
                type: 'button',
                style: { ...btn, color: 'var(--color-destructive, #dc2626)', borderColor: 'var(--color-destructive, #dc2626)' },
                disabled: busy, onClick: () => removeKey(rec),
              }, 'Delete'),
            ),
          ),
          
          // Insertion conditionnelle du bloc de saisie SOUS les détails de la clé concernée
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
            h('button', { type: 'button', style: btnPrimary, disabled: busy, onClick: () => confirmUnlock(rec) }, 'OK'),
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

    h('div', null,
      h('h3', { style: { margin: '0 0 8px', fontSize: '15px', fontWeight: 600 } }, 'Defaults for new messages'),
      h('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', marginBottom: '6px' } },
        h('input', { type: 'checkbox', checked: !!prefs.defaultSign, onChange: (e) => setPref('defaultSign', e.target.checked) }),
        'Sign new messages by default'),
      h('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' } },
        h('input', { type: 'checkbox', checked: !!prefs.defaultEncrypt, onChange: (e) => setPref('defaultEncrypt', e.target.checked) }),
        'Encrypt new messages by default (when all recipients have verified keys)'),
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

export const slots = {
  'composer-toolbar': { component: ComposerToolbar, order: 70 },
  'email-banner': { component: EmailBanner, order: 20 },
  'settings-section': { component: SettingsSection, order: 100 },
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