/**
 * S/MIME — privileged (same-origin) webmail plugin.
 *
 * Replaces the former native S/MIME pipeline with a sandboxed plugin that
 * runs all cryptography locally (bundled pkijs/asn1js/webcrypto-liner):
 *
 *   • onComposeSend   (intercept)  → build MIME, sign/encrypt, api.jmap.sendRaw
 *   • onRenderEmailBody (transform) → api.jmap.fetchBlob, decrypt/verify, replace body
 *   • composer-toolbar slot         → per-message Sign / Encrypt toggles
 *   • email-banner slot             → signature / encryption status
 *   • settings-section slot         → key import, unlock/lock, recipient certs
 *
 * Private keys are imported from PKCS#12, AES-GCM-wrapped under PBKDF2(600k),
 * and unlocked into NON-EXTRACTABLE WebCrypto keys held in a same-origin
 * IndexedDB session store shared between the background and slot iframes.
 */

const host = require('@plugin-host');
const React = require('react');
const h = React.createElement;
const { useState, useEffect, useCallback, useRef } = React;

import { buildMimeMessage, wrapCmsAsSmimeMessage, base64Encode } from './mime-builder.js';
import { smimeSign } from './smime-sign.js';
import { smimeEncrypt } from './smime-encrypt.js';
import { smimeVerify } from './smime-verify.js';
import { smimeDecrypt, normalizeCmsBytes, SmimeKeyLockedError } from './smime-decrypt.js';
import { detectSmime } from './smime-detect.js';
import { parseMime } from './mime-parse.js';
import { importPkcs12, unlockPrivateKey } from './pkcs12.js';
import { parseCertificatePemOrDer, extractCertificateInfo } from './certificate-utils.js';
import { generateUUID } from './util.js';
import {
  saveKeyRecord, listKeyRecords, deleteKeyRecord,
  savePublicCert, listPublicCerts, deletePublicCert,
  saveSessionKeys, getSessionKeys, deleteSessionKeys, clearSessionKeys,
} from './key-storage.js';

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
async function setPrefs(next) {
  await host.storage.set(PREFS_KEY, next);
}

function settings() {
  return host.plugin?.settings || {};
}
function useAes128() {
  return settings().encryptionStrength === 'aes-128';
}

// ─── Privileged-tier capability probe ─────────────────────────────────
// S/MIME needs in-frame `crypto.subtle` + IndexedDB, which exist only in the
// privileged (same-origin) tier. In the untrusted (null-origin) sandbox,
// `indexedDB.open` throws "The operation is insecure" and `crypto.subtle` is
// absent. We probe once and degrade with a clear message instead of letting a
// raw IndexedDB error crash activate() (which would trip the circuit breaker).

const NOT_PRIVILEGED_MSG =
  'S/MIME could not start: it is running in the restricted (untrusted) plugin ' +
  'sandbox, where in-browser cryptography and key storage are unavailable. ' +
  'This plugin must be delivered as a signed, admin-approved bundle with ' +
  '"tier": "privileged" so it loads in the same-origin tier. Contact your ' +
  'administrator.';

let _capable = null;
async function isCapable() {
  if (_capable !== null) return _capable;
  try {
    if (typeof indexedDB === 'undefined' || !(crypto && crypto.subtle)) throw new Error('missing apis');
    await new Promise((resolve, reject) => {
      let req;
      try { req = indexedDB.open('smime-capability-probe'); }
      catch (e) { reject(e); return; }
      req.onsuccess = () => { try { req.result.close(); } catch { /* ignore */ } resolve(); };
      req.onerror = () => reject(req.error || new Error('indexedDB open failed'));
      req.onblocked = () => resolve();
    });
    _capable = true;
  } catch {
    _capable = false;
  }
  return _capable;
}

// ─── Address helpers ──────────────────────────────────────────────────

function parseAddr(value) {
  if (value && typeof value === 'object' && value.email) {
    return { name: value.name || undefined, email: String(value.email) };
  }
  const s = String(value || '');
  const m = s.match(/^\s*(?:"?([^"<]*?)"?\s*)?<?\s*([^<>\s]+@[^<>\s]+)\s*>?\s*$/);
  if (m) return { name: (m[1] || '').trim() || undefined, email: m[2] };
  return { email: s.trim() };
}
function addrList(arr) {
  if (!arr) return [];
  return (Array.isArray(arr) ? arr : [arr]).map(parseAddr).filter((a) => a.email);
}
function emailsOf(arr) {
  return addrList(arr).map((a) => a.email.toLowerCase());
}

// ─── Blob/bytes helpers ────────────────────────────────────────────────

async function blobToBytes(blob) {
  return new Uint8Array(await blob.arrayBuffer());
}
function bytesArrayBuffer(u8) {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}

/** Wrap a CMS blob as a nested MIME entity (for sign-then-encrypt). */
function cmsInnerEntity(cmsBytes, smimeType) {
  const header = [
    `Content-Type: application/pkcs7-mime; smime-type=${smimeType}; name="smime.p7m"`,
    'Content-Transfer-Encoding: base64',
    'Content-Disposition: attachment; filename="smime.p7m"',
    '',
  ].join('\r\n');
  const b64 = base64Encode(bytesArrayBuffer(cmsBytes));
  return new TextEncoder().encode(header + '\r\n' + b64 + '\r\n');
}

// ─── Key resolution ────────────────────────────────────────────────────

async function signingKeyRecordForEmail(fromEmail) {
  const recs = await listKeyRecords();
  const lower = (fromEmail || '').toLowerCase();
  return (
    recs.find((r) => r.email === lower && r.capabilities?.canSign !== false) ||
    recs.find((r) => r.email === lower) ||
    undefined
  );
}

async function recipientCertsFor(emails) {
  const certs = await listPublicCerts();
  const found = [];
  const missing = [];
  for (const email of emails) {
    const c = certs.find((pc) => pc.email.toLowerCase() === email.toLowerCase());
    if (c) found.push(c.certificate);
    else missing.push(email);
  }
  return { found, missing };
}

// Build decrypt key maps from the session store, across all key records.
async function unlockedDecryptMaps() {
  const recs = await listKeyRecords();
  const unlockedKeys = new Map();
  const legacyUnlockedKeys = new Map();
  for (const r of recs) {
    const s = await getSessionKeys(r.id);
    if (!s) continue;
    if (s.decryptionKey) unlockedKeys.set(r.id, s.decryptionKey);
    if (s.legacyDecryptionKey) legacyUnlockedKeys.set(r.id, s.legacyDecryptionKey);
  }
  return { keyRecords: recs, unlockedKeys, legacyUnlockedKeys };
}

// ─── Compose-send takeover ─────────────────────────────────────────────

async function resolveIntent(req) {
  const pick = (...vals) => {
    for (const v of vals) if (typeof v === 'boolean') return v;
    return undefined;
  };
  let sign = pick(req.sign, req.smimeSign, req.intent && req.intent.sign, req.smime && req.smime.sign);
  let encrypt = pick(req.encrypt, req.smimeEncrypt, req.intent && req.intent.encrypt, req.smime && req.smime.encrypt);

  if (sign === undefined && encrypt === undefined) {
    // Fall back to the composer-toolbar slot's stored intent, then prefs.
    const stored = (await host.storage.get(INTENT_KEY)) || {};
    const prefs = await getPrefs();
    sign = typeof stored.sign === 'boolean' ? stored.sign : prefs.defaultSign;
    encrypt = typeof stored.encrypt === 'boolean' ? stored.encrypt : prefs.defaultEncrypt;
  }
  return { sign: !!sign, encrypt: !!encrypt };
}

async function fetchAttachments(req) {
  const list = req.attachments || [];
  const out = [];
  for (const att of list) {
    if (!att || !att.blobId) continue;
    try {
      const bytes = await host.jmap.fetchBlob(att.blobId, { name: att.name, type: att.type });
      out.push({
        filename: att.name || 'attachment',
        contentType: att.type || 'application/octet-stream',
        content: bytesArrayBuffer(bytes),
      });
    } catch (err) {
      host.log.warn('attachment fetch failed', att.name, err);
      throw new Error(`Could not read attachment "${att.name || ''}" for encryption`);
    }
  }
  return out;
}

async function onComposeSend(req) {
  if (!req || typeof req !== 'object') return undefined;

  const { sign, encrypt } = await resolveIntent(req);
  if (!sign && !encrypt) return undefined; // not our job — host sends normally

  if (!(await isCapable())) {
    host.toast.error('Cannot sign/encrypt: S/MIME is not running in the privileged tier.');
    return false; // refuse rather than send plaintext when sign/encrypt was requested
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

    const keyRecord = (sign || encrypt) ? await signingKeyRecordForEmail(from.email) : undefined;
    if ((sign || encrypt) && !keyRecord) {
      host.toast.error(`No S/MIME key for ${from.email}. Import one in Settings → Plugins → S/MIME.`);
      return false;
    }

    // Build the inner MIME message from the draft.
    const attachments = await fetchAttachments(req);
    let payloadBytes = buildMimeMessage({
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

    // 1. Sign (opaque). If we'll also encrypt, nest the signed CMS as a MIME entity.
    if (sign) {
      const session = await getSessionKeys(keyRecord.id);
      if (!session || !session.signingKey) {
        host.toast.error('Your S/MIME key is locked. Unlock it in Settings → Plugins → S/MIME, then resend.');
        return false;
      }
      const signedBlob = await smimeSign(
        payloadBytes,
        session.signingKey,
        keyRecord.certificate,
        keyRecord.certificateChain || [],
      );
      const signedBytes = await blobToBytes(signedBlob);
      payloadBytes = encrypt ? cmsInnerEntity(signedBytes, 'signed-data') : signedBytes;
    }

    // 2. Encrypt (envelope). Always includes the sender cert so Sent is readable.
    let smimeType = sign ? 'signed-data' : null;
    if (encrypt) {
      const { found, missing } = await recipientCertsFor(allRecipientEmails);
      if (missing.length > 0) {
        host.toast.error(`Missing encryption certificate for: ${missing.join(', ')}`);
        return false;
      }
      const envBlob = await smimeEncrypt(payloadBytes, found, keyRecord.certificate, useAes128());
      payloadBytes = await blobToBytes(envBlob);
      smimeType = 'enveloped-data';
    }

    // 3. Wrap as RFC822 and submit raw.
    const rfc822 = wrapCmsAsSmimeMessage(payloadBytes, {
      from,
      to,
      cc,
      subject: req.subject || '',
      inReplyTo: req.inReplyTo,
      references: req.references,
      smimeType,
    });
    const rawBytes = await blobToBytes(rfc822);

    const envelopeRecipients = [...new Set([...allRecipientEmails])];
    await host.jmap.sendRaw(bytesArrayBuffer(rawBytes), identityId, { envelopeRecipients });

    host.toast.success(
      encrypt && sign ? 'Message signed, encrypted and sent'
        : encrypt ? 'Message encrypted and sent'
          : 'Message signed and sent',
    );
    // Clear the per-message intent so the next compose starts from defaults.
    await host.storage.set(INTENT_KEY, {});
    return false; // we handled the send
  } catch (err) {
    host.log.error('onComposeSend failed', err);
    host.toast.error(`S/MIME send failed: ${err && err.message ? err.message : String(err)}`);
    return false; // do NOT fall through to a plaintext send when sign/encrypt was requested
  }
}

// ─── Render-body takeover (verify / decrypt) ───────────────────────────

async function maybeAutoImportSigner(status) {
  if (settings().autoImportSignerCerts === false) return;
  const cert = status && status.signerCert;
  if (!cert || !status.signatureValid || !cert.email) return;
  try {
    const existing = (await listPublicCerts()).some((c) => c.fingerprint === cert.fingerprint);
    if (!existing) {
      await savePublicCert({
        id: generateUUID(),
        email: cert.email,
        certificate: cert.certificate,
        issuer: cert.issuer,
        subject: cert.subject,
        notBefore: cert.notBefore,
        notAfter: cert.notAfter,
        fingerprint: cert.fingerprint,
        source: 'signed-email',
      });
    }
  } catch (err) {
    host.log.warn('auto-import signer cert failed', err);
  }
}

function statusNoticeHtml(message, tone) {
  const color = tone === 'error' ? 'var(--color-destructive, #dc2626)'
    : tone === 'ok' ? 'var(--color-success, #16a34a)'
      : 'var(--color-muted-foreground, #64748b)';
  return `<div style="padding:12px;border:1px solid ${color};border-radius:8px;color:${color};font-size:14px;">${message}</div>`;
}

async function persistVerifyStatus(emailId, status) {
  if (!emailId) return;
  try { await host.storage.set(VERIFY_PREFIX + emailId, status); } catch { /* ignore */ }
}

async function onRenderEmailBody(body, ctx) {
  if (!ctx) return undefined;
  if (!(await isCapable())) return undefined; // can't decrypt/verify without the privileged tier

  const detection = detectSmime(ctx.contentType, ctx.bodyStructure, ctx.attachments);
  if (!detection.type) return undefined;

  if (!detection.supported) {
    const status = {
      isSigned: detection.type === 'detached-sig',
      isEncrypted: false,
      unsupportedReason: `Unsupported S/MIME type (${detection.type})`,
    };
    await persistVerifyStatus(ctx.id, status);
    return undefined; // let the host render the original body
  }

  const blobId = detection.blobId || ctx.blobId;
  if (!blobId) return undefined;

  const fromEmail = (addrList(ctx.from)[0] || {}).email;

  try {
    const raw = await host.jmap.fetchBlob(blobId);
    const der = normalizeCmsBytes(bytesArrayBuffer(raw instanceof Uint8Array ? raw : new Uint8Array(raw)));

    if (detection.type === 'enveloped-data') {
      const { keyRecords, unlockedKeys, legacyUnlockedKeys } = await unlockedDecryptMaps();
      let result;
      try {
        result = await smimeDecrypt({ cmsBytes: der, keyRecords, unlockedKeys, legacyUnlockedKeys });
      } catch (err) {
        if (err instanceof SmimeKeyLockedError) {
          const status = { isEncrypted: true, decryptionSuccess: false, decryptionError: 'locked' };
          await persistVerifyStatus(ctx.id, status);
          return {
            ...body,
            handledBy: 'smime',
            html: statusNoticeHtml('🔒 This message is encrypted. Unlock your S/MIME key in Settings → Plugins → S/MIME to read it.', 'muted'),
            text: 'This message is encrypted. Unlock your S/MIME key to read it.',
            attachments: [],
            verification: status,
          };
        }
        const status = { isEncrypted: true, decryptionSuccess: false, decryptionError: err && err.message ? err.message : String(err) };
        await persistVerifyStatus(ctx.id, status);
        return {
          ...body,
          handledBy: 'smime',
          html: statusNoticeHtml(`🔒 Could not decrypt this message: ${status.decryptionError}`, 'error'),
          text: `Could not decrypt this message: ${status.decryptionError}`,
          attachments: [],
          verification: status,
        };
      }

      // Decrypted inner content may itself be a signed CMS — either nested as a
      // MIME entity (RFC 8551 sign-then-encrypt, the Outlook/Thunderbird form)
      // or, more rarely, raw CMS DER. Detect both.
      let innerBytes = result.mimeBytes;
      const verification = { isEncrypted: true, decryptionSuccess: true };
      const innerCt = innerContentType(innerBytes);
      const innerDet = detectSmime(innerCt, null, null);
      const looksSigned = innerDet.type === 'signed-data' || innerBytes[0] === 0x30;
      if (looksSigned) {
        try {
          const signedDer = normalizeCmsBytes(bytesArrayBuffer(innerBytes));
          const v = await smimeVerify(signedDer, fromEmail);
          innerBytes = v.mimeBytes;
          Object.assign(verification, v.status, { isEncrypted: true, decryptionSuccess: true });
          await maybeAutoImportSigner(v.status);
        } catch { /* not actually signed; keep decrypted content as-is */ }
      }

      const parsed = parseMime(innerBytes);
      await persistVerifyStatus(ctx.id, verification);
      return {
        ...body,
        handledBy: 'smime',
        html: parsed.html || '',
        text: parsed.text || '',
        attachments: parsed.attachments,
        verification,
      };
    }

    if (detection.type === 'signed-data') {
      const v = await smimeVerify(der, fromEmail);
      await maybeAutoImportSigner(v.status);
      const parsed = parseMime(v.mimeBytes);
      await persistVerifyStatus(ctx.id, v.status);
      return {
        ...body,
        handledBy: 'smime',
        html: parsed.html || '',
        text: parsed.text || '',
        attachments: parsed.attachments,
        verification: v.status,
      };
    }
  } catch (err) {
    host.log.error('onRenderEmailBody failed', err);
    return undefined; // fall back to host rendering on unexpected failure
  }

  return undefined;
}

// Sniff the Content-Type of an inner MIME entity (first headers only).
function innerContentType(bytes) {
  const head = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, 2048));
  const m = head.match(/content-type:\s*([^\r\n]+)/i);
  return m ? m[1].trim() : '';
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
const input = {
  font: 'inherit',
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid var(--color-input, #cbd5e1)',
  background: 'var(--color-background, #fff)',
  color: 'var(--color-foreground, #0f172a)',
  width: '100%',
  boxSizing: 'border-box',
};

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}
function isExpired(iso) {
  try { return new Date(iso).getTime() < Date.now(); } catch { return false; }
}

// ─── UI: composer toolbar (Sign / Encrypt toggles) ─────────────────────

function ComposerToolbar() {
  const [intent, setIntent] = useState({ sign: false, encrypt: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!(await isCapable())) { setReady(false); return; }
        const stored = (await host.storage.get(INTENT_KEY)) || {};
        const prefs = await getPrefs();
        setIntent({
          sign: typeof stored.sign === 'boolean' ? stored.sign : prefs.defaultSign,
          encrypt: typeof stored.encrypt === 'boolean' ? stored.encrypt : prefs.defaultEncrypt,
        });
        const recs = await listKeyRecords();
        setReady(recs.length > 0);
      } catch { setReady(false); }
    })();
  }, []);

  const update = useCallback(async (next) => {
    setIntent(next);
    await host.storage.set(INTENT_KEY, next);
  }, []);

  const toggle = (key) => update({ ...intent, [key]: !intent[key] });

  const pill = (active) => ({
    ...btn,
    background: active ? 'var(--color-primary, #2563eb)' : 'var(--color-muted, #f1f5f9)',
    color: active ? '#fff' : 'var(--color-foreground, #0f172a)',
    border: active ? '1px solid var(--color-primary, #2563eb)' : '1px solid var(--color-input, #cbd5e1)',
  });

  if (!ready) {
    return h('span', { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' } },
      'S/MIME: import a key in Settings to sign/encrypt');
  }

  return h('div', { style: { display: 'inline-flex', gap: '6px', alignItems: 'center' } },
    h('button', {
      type: 'button',
      style: pill(intent.sign),
      title: 'Digitally sign this message',
      onClick: () => toggle('sign'),
    }, intent.sign ? '✓ Sign' : 'Sign'),
    h('button', {
      type: 'button',
      style: pill(intent.encrypt),
      title: 'Encrypt this message to its recipients',
      onClick: () => toggle('encrypt'),
    }, intent.encrypt ? '✓ Encrypt' : 'Encrypt'),
  );
}

// ─── UI: email banner (verification / encryption status) ───────────────

function EmailBanner(props) {
  const email = props && props.email;
  const [status, setStatus] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!email || !email.id) { setLoaded(true); return; }
      let s = await host.storage.get(VERIFY_PREFIX + email.id);
      if (!s) {
        // No render-hook result yet — best-effort detect from headers/source.
        const ct = email.headers && (email.headers['Content-Type'] || email.headers['content-type']);
        const det = detectSmime(Array.isArray(ct) ? ct[0] : ct, undefined, undefined);
        if (det.type === 'enveloped-data') s = { isEncrypted: true };
        else if (det.type === 'signed-data') s = { isSigned: true };
        else if (det.type === 'detached-sig') s = { isSigned: true, unsupportedReason: 'detached signature' };
      }
      if (alive) { setStatus(s || null); setLoaded(true); }
    })();
    return () => { alive = false; };
  }, [email && email.id]);

  if (!loaded || !status) return null;

  const rows = [];
  const warnSelfSigned = settings().warnOnSelfSigned !== false;

  if (status.isEncrypted) {
    if (status.decryptionSuccess) rows.push(['🔓', 'Decrypted', 'ok']);
    else if (status.decryptionError === 'locked') rows.push(['🔒', 'Encrypted — unlock your key to read', 'warn']);
    else if (status.decryptionError) rows.push(['🔒', `Encrypted — ${status.decryptionError}`, 'error']);
    else rows.push(['🔒', 'Encrypted message', 'muted']);
  }
  if (status.isSigned || status.signerCert) {
    if (status.signatureValid) {
      const who = status.signerCert && status.signerCert.email ? ` by ${status.signerCert.email}` : '';
      const mismatch = status.signerEmailMatch === false ? ' ⚠ signer ≠ From' : '';
      const ss = warnSelfSigned && status.selfSigned ? ' (self-signed)' : '';
      rows.push(['🛡️', `Signature valid${who}${ss}${mismatch}`, status.signerEmailMatch === false ? 'warn' : 'ok']);
    } else if (status.signatureError) {
      rows.push(['⚠️', `Signature invalid: ${status.signatureError}`, 'error']);
    } else {
      rows.push(['✍️', 'Signed message', 'muted']);
    }
  }
  if (status.unsupportedReason) rows.push(['ℹ️', status.unsupportedReason, 'muted']);

  if (rows.length === 0) return null;

  const toneColor = (tone) => tone === 'ok' ? 'var(--color-success, #16a34a)'
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

// ─── UI: settings section (key & certificate management) ───────────────

function SettingsSection() {
  const [keys, setKeys] = useState([]);
  const [certs, setCerts] = useState([]);
  const [prefs, setPrefsState] = useState(DEFAULT_PREFS);
  const [unlocked, setUnlocked] = useState({}); // id -> bool
  const [busy, setBusy] = useState(false);
  const [capable, setCapable] = useState(true);
  const fileRef = useRef(null);
  const certFileRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!(await isCapable())) { setCapable(false); return; }
    const [k, c, p] = await Promise.all([listKeyRecords(), listPublicCerts(), getPrefs()]);
    setKeys(k); setCerts(c); setPrefsState(p);
    const u = {};
    for (const rec of k) u[rec.id] = !!(await getSessionKeys(rec.id));
    setUnlocked(u);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  if (!capable) {
    return h('div', { style: { ...card, borderColor: 'var(--color-destructive, #dc2626)', color: 'var(--color-destructive, #dc2626)', maxWidth: '720px' } },
      h('div', { style: { fontWeight: 600, marginBottom: '6px' } }, 'S/MIME is not active'),
      h('div', { style: { fontSize: '13px', lineHeight: 1.5 } }, NOT_PRIVILEGED_MSG),
    );
  }

  async function importKeyFile() {
    const file = fileRef.current && fileRef.current.files && fileRef.current.files[0];
    if (!file) return;
    const p12pass = window.prompt('Passphrase that protects the .p12/.pfx file:');
    if (p12pass === null) return;
    const storagePass = window.prompt('Choose a passphrase to protect this key in your browser:');
    if (!storagePass) { host.toast.error('A storage passphrase is required'); return; }
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const { keyRecord } = await importPkcs12(buf, p12pass, storagePass);
      await saveKeyRecord(keyRecord);
      host.toast.success(`Imported S/MIME key for ${keyRecord.email || 'certificate'}`);
      if (fileRef.current) fileRef.current.value = '';
      await refresh();
    } catch (err) {
      host.toast.error(`Import failed: ${err && err.message ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function unlock(rec) {
    const pass = window.prompt(`Passphrase for ${rec.email || 'this key'}:`);
    if (!pass) return;
    setBusy(true);
    try {
      const { signingKey, decryptionKey, legacyDecryptionKey } = await unlockPrivateKey(rec, pass);
      await saveSessionKeys({ id: rec.id, signingKey, decryptionKey, legacyDecryptionKey });
      host.toast.success(`Unlocked ${rec.email || 'key'}`);
      await refresh();
    } catch (err) {
      host.toast.error(err && err.message ? err.message : 'Unlock failed');
    } finally {
      setBusy(false);
    }
  }

  async function lock(rec) {
    await deleteSessionKeys(rec.id);
    host.toast.info(`Locked ${rec.email || 'key'}`);
    await refresh();
  }

  async function removeKey(rec) {
    const ok = await host.ui.confirm({
      title: 'Delete S/MIME key',
      message: `Delete the private key and certificate for ${rec.email || 'this identity'}? You will no longer be able to decrypt mail encrypted to it.`,
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
      const buf = await file.arrayBuffer();
      const cert = parseCertificatePemOrDer(buf);
      const der = cert.toSchema(true).toBER(false);
      const info = await extractCertificateInfo(cert, der);
      const email = (info.emailAddresses[0] || '').toLowerCase();
      if (!email) throw new Error('Certificate has no email address');
      await savePublicCert({
        id: generateUUID(),
        email,
        certificate: der,
        issuer: info.issuer,
        subject: info.subject,
        notBefore: info.notBefore,
        notAfter: info.notAfter,
        fingerprint: info.fingerprint,
        source: 'manual',
      });
      host.toast.success(`Imported certificate for ${email}`);
      if (certFileRef.current) certFileRef.current.value = '';
      await refresh();
    } catch (err) {
      host.toast.error(`Certificate import failed: ${err && err.message ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function removeCert(c) {
    await deletePublicCert(c.id);
    await refresh();
  }

  async function setPref(key, value) {
    const next = { ...prefs, [key]: value };
    setPrefsState(next);
    await setPrefs(next);
  }

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' } },
    h('div', null,
      h('h3', { style: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600 } }, 'Your keys'),
      h('p', { style: { margin: '0 0 8px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } },
        'Import a PKCS#12 (.p12/.pfx) file containing your certificate and private key. The key is encrypted in your browser and never leaves it.'),
      h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' } },
        h('input', { ref: fileRef, type: 'file', accept: '.p12,.pfx', style: { fontSize: '13px' } }),
        h('button', { type: 'button', style: btnPrimary, disabled: busy, onClick: importKeyFile }, 'Import key'),
      ),
      keys.length === 0
        ? h('div', { style: { ...card, fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } }, 'No keys imported yet.')
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          keys.map((rec) => h('div', { key: rec.id, style: card },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' } },
              h('div', null,
                h('div', { style: { fontWeight: 600, fontSize: '14px' } }, rec.email || rec.subject || 'Certificate'),
                h('div', { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' } },
                  `${rec.algorithm} · valid ${fmtDate(rec.notBefore)} – ${fmtDate(rec.notAfter)}${isExpired(rec.notAfter) ? ' · EXPIRED' : ''}`),
                h('div', { style: { fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-muted-foreground, #64748b)', wordBreak: 'break-all' } },
                  rec.fingerprint),
                h('div', { style: { fontSize: '11px', color: 'var(--color-muted-foreground, #64748b)' } },
                  `${rec.capabilities && rec.capabilities.canSign ? 'sign' : ''}${rec.capabilities && rec.capabilities.canSign && rec.capabilities.canEncrypt ? ' · ' : ''}${rec.capabilities && rec.capabilities.canEncrypt ? 'encrypt' : ''}`),
              ),
              h('div', { style: { display: 'flex', gap: '6px', alignItems: 'flex-start' } },
                unlocked[rec.id]
                  ? h('button', { type: 'button', style: btn, disabled: busy, onClick: () => lock(rec) }, '🔓 Lock')
                  : h('button', { type: 'button', style: btnPrimary, disabled: busy, onClick: () => unlock(rec) }, '🔒 Unlock'),
                h('button', {
                  type: 'button',
                  style: { ...btn, color: 'var(--color-destructive, #dc2626)', borderColor: 'var(--color-destructive, #dc2626)' },
                  disabled: busy, onClick: () => removeKey(rec),
                }, 'Delete'),
              ),
            ),
          )),
        ),
    ),

    h('div', null,
      h('h3', { style: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600 } }, 'Recipient certificates'),
      h('p', { style: { margin: '0 0 8px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } },
        'Public certificates (PEM/DER) of people you want to send encrypted mail to. Signer certificates from validly signed mail are saved automatically.'),
      h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' } },
        h('input', { ref: certFileRef, type: 'file', accept: '.pem,.crt,.cer,.der', style: { fontSize: '13px' } }),
        h('button', { type: 'button', style: btn, disabled: busy, onClick: importCertFile }, 'Import certificate'),
      ),
      certs.length === 0
        ? h('div', { style: { ...card, fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } }, 'No recipient certificates.')
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
        'Encrypt new messages by default (when all recipients have certificates)'),
    ),
  );
}

// ─── Exports ───────────────────────────────────────────────────────────

export const hooks = {
  onComposeSend,
  onRenderEmailBody,
  // Wipe unlocked keys from the shared session store on sign-out / account switch.
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

export async function activate(api) {
  // Bail out gracefully if we're not in the privileged (same-origin) tier — do
  // NOT throw, or the circuit breaker disables the plugin after a raw IDB error.
  if (!(await isCapable())) {
    api.log.error(NOT_PRIVILEGED_MSG);
    try { api.toast.error('S/MIME needs the privileged tier — see plugin logs / contact your admin.'); } catch { /* ignore */ }
    return;
  }
  // Enforce session scope for unlocked keys: wipe any left over from a prior
  // app session at boot (mirrors the native "in-memory, cleared on reload").
  try { await clearSessionKeys(); } catch (err) { api.log.warn('S/MIME: clearSessionKeys failed', err); }
  let keyCount = 0;
  try { keyCount = (await listKeyRecords()).length; } catch (err) { api.log.warn('S/MIME: listKeyRecords failed', err); }
  api.log.info(`S/MIME plugin activated (${keyCount} key${keyCount === 1 ? '' : 's'} imported)`);
}
