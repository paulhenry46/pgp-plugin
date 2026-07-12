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
import { listKeyRecords } from './storage.ts';

import {EmailSecuBanner, EmailBanner} from './ui/banners.tsx';
import {SettingsSection} from './ui/settings.tsx';
import {ComposerToolbar} from './ui/composer-toolbar.tsx';
import {settings} from './shared.ts';
import {onRenderEmailBody} from './hooks/onRenderEmailBody.ts';
import {onBeforeDraftAutoSave} from './hooks/onBeforeDraftAutoSave.ts';
import {onBeforeEditDraft} from './hooks/onBeforeEditDraft.ts';
import {onBeforeBlobUpload} from './hooks/onBeforeBlobUpload.ts';
import {onComposeSend} from './hooks/onComposeSend.ts';
import { initBackgroundSessionListener } from './pgp/session-broadcast.ts';
import { onEmailListItemRender } from './hooks/onEmailListRender.ts';
import { onSearchResults } from './hooks/onSearchresults.ts';


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


// ─── Exports ───────────────────────────────────────────────────────────

export const hooks = {
  onComposeSend,
  onRenderEmailBody,
  onBeforeEditDraft,
  onBeforeDraftAutoSave,
  onBeforeBlobUpload,
  onEmailListItemRender,
  onSearchResults,
 /*  async onAfterLogout() {
    if (settings().lockOnLogout === false) return;
    try { await clearSessionKeys(); } catch (err) { host.log.warn('clearSessionKeys failed', err); }
  },
  async onAccountSwitch() {
    if (settings().lockOnLogout === false) return;
    try { await clearSessionKeys(); } catch (err) { host.log.warn('clearSessionKeys failed', err); }
  }, */
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
  initBackgroundSessionListener();
  
  api.log.info('OpenPGP plugin activated with memory-only session management.');
  let keyCount = 0;
  try { keyCount = (await listKeyRecords()).length; } catch (err) { api.log.warn('OpenPGP: listKeyRecords failed', err); }
  api.log.info(`OpenPGP plugin activated (${keyCount} key${keyCount === 1 ? '' : 's'} available)`);
}