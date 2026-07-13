import host from '@plugin-host';
import React from 'react'
import * as openpgp from 'openpgp';

const h = React.createElement;
const { useState, useEffect, useCallback, useRef } = React;
import {
  saveKeyRecord, listKeyRecords, deleteKeyRecord, listPublicCerts, deletePublicCert,
  KeyRecord, PublicCert
} from '../storage.ts';

import { importOpenPgpPrivateKey, importOpenPgpPublicKey, unlockPrivateKey } from '../pgp/import.ts';
import { btn, fmtDate, isExpired, card } from './shared.ts';
import { isCapable, NOT_PRIVILEGED_MSG } from '../index.tsx';
import { registerWebAuthnPRF, getWebAuthnPRF } from '../webauthn/index.ts';
import { encryptPassphraseWithWebAuthn, decryptPassphraseWithWebAuthn } from '../webauthn/settings.ts';

import { 
  fetchKeyFromBackground, 
  broadcastUnlockKey, 
  broadcastLockKey,
  subscribeToKeyUpdates
} from '../pgp/session-broadcast.ts';
import { uploadKey, requestVerify, lookup } from '../pgp/server.ts';
import { deriveAesKeyFromPgpParams, getIndex } from '../cache.ts';

export function SettingsSection() {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [certs, setCerts] = useState<PublicCert[]>([]); 
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<boolean>(false);
  const [capable, setCapable] = useState<boolean>(true);
  
  const fileRef = useRef<HTMLInputElement | null>(null);
  const certFileRef = useRef<HTMLInputElement | null>(null);
  const [searchEmail, setSearchEmail] = useState<string>('');

  const refresh = useCallback(async () => {
    if (!(await isCapable())) { setCapable(false); return; }
    const [k, c] = await Promise.all([listKeyRecords(), listPublicCerts()]);
    setKeys(k); setCerts(c);
    
    const u: Record<string, boolean> = {};
    for (const rec of k) {
      u[rec.id] = !!(await fetchKeyFromBackground(rec.id));
    }
    setUnlocked(u);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const unsubscribe = subscribeToKeyUpdates(() => {
      void refresh();
    });
    return unsubscribe;
  }, [refresh]);

  if (!capable) {
    return h('div', { style: { ...card, borderColor: 'var(--color-destructive, #dc2626)', color: 'var(--color-destructive, #dc2626)', maxWidth: '720px' } },
      h('div', { style: { fontWeight: 600, marginBottom: '6px' } }, 'OpenPGP is not active'),
      h('div', { style: { fontSize: '13px', lineHeight: 1.5 } }, NOT_PRIVILEGED_MSG),
    );
  }

  async function handleFileChange() {
    const file = fileRef.current && fileRef.current.files && fileRef.current.files[0];
    if (!file) return;

    // Use host.ui.prompt to gather both the active key passphrase and an optional new storage passphrase
    const result = await host.ui.prompt({
      title: host.i18n.t('prompt.import_private_key.title'),
      message: host.i18n.t('prompt.import_private_key.message'),
      fields: [
        { 
          name: 'currentPassphrase', 
          label: host.i18n.t('prompt.import_private_key.current_passphrase_label'), 
          type: 'password', 
          required: true 
        },
        { 
          name: 'storagePassphrase', 
          label: host.i18n.t('prompt.import_private_key.storage_passphrase_label'), 
          type: 'password', 
          required: false 
        }
      ]
    });

    if (!result || !result.currentPassphrase) {
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const currentPass = result.currentPassphrase;
    const storagePass = result.storagePassphrase?.trim() || currentPass;

    setBusy(true);
    try {
      const text = new TextDecoder().decode(await file.arrayBuffer());
      const { keyRecord } = await importOpenPgpPrivateKey(text, storagePass, currentPass);
      
      await saveKeyRecord(keyRecord);
      host.toast.success(`Imported OpenPGP key for ${keyRecord.email || 'identity'}`);
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(`Import failed: ${error?.message ? error.message : String(err)}`);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
      setBusy(false);
    }
  }

  // 1. Liaison d'une clé existante à WebAuthn (Bouton d'enrôlement)
  async function handleLinkWebAuthn(rec: KeyRecord) {
  let passphrase = "";

  // 1. On récupère la passphrase. Idéalement via une invite utilisateur pour être sûr de l'avoir
  const result = await host.ui.prompt({
    title: "Activer WebAuthn",
    message: `Veuillez saisir la passphrase de votre clé pour lier votre empreinte/Bitwarden.`,
    fields: [{ name: 'passphrase', label: 'Passphrase actuelle', type: 'password', required: true }]
  });
  
  if (!result || !result.passphrase) return;
  passphrase = result.passphrase;

  // Optionnel : Valider rapidement que la passphrase est la bonne avant d'aller plus loin
  try {
    await unlockPrivateKey(rec, passphrase);
  } catch {
    host.toast.error("Passphrase incorrecte. Liaison annulée.");
    return;
  }

  setBusy(true);
  try {
    // 2. Déclenche l'enregistrement Passkey (Bitwarden / TouchID)
    const { credentialId, prfSecret } = await registerWebAuthnPRF(rec.email || "user@pgp");
    
    // 3. Chiffre la VRAIE passphrase avec le secret WebAuthn
    const { ciphertext, iv } = await encryptPassphraseWithWebAuthn(passphrase, prfSecret);

    // 4. Sauvegarde dans IndexedDB
    await saveKeyRecord({
      ...rec,
      webauthn: {
        credentialId,
        encryptedPassphrase: ciphertext,
        iv: iv.buffer.slice(0) as ArrayBuffer
      }
    });

    host.toast.success("Authentification biométrique activée !");
    await refresh();
  } catch (err) {
    const error = err as Error;
    host.toast.error(`Échec WebAuthn : ${error?.message || String(err)}`);
  } finally {
    setBusy(false);
  }
}

  async function handleUnlockAllWithWebAuthn() {
  const webauthnKeys = keys.filter(k => k.webauthn && !unlocked[k.id]);
  if (webauthnKeys.length === 0) return;

  setBusy(true);
  try {
    for (const rec of webauthnKeys) {
      if (!rec.webauthn) continue;

      // 1. Récupère le secret PRF depuis le gestionnaire
      const prfSecret = await getWebAuthnPRF(rec.webauthn.credentialId);
      
      // 2. Déchiffre la VRAIE passphrase originale
      const realPassphrase = await decryptPassphraseWithWebAuthn(
        rec.webauthn.encryptedPassphrase,
        prfSecret,
        rec.webauthn.iv
      );

      // 3. Appelle la fonction d'origine ! Elle gère déjà le PGP, la aesKey et le getIndex()
      const { unlockedPrivateKey, signingKey, decryptionKey, aesKey } = await unlockPrivateKey(rec, realPassphrase);
      
      // 4. Envoie le tout au background
      broadcastUnlockKey({
        id: rec.id,
        unlockedPrivateKey,
        signingKey,
        decryptionKey,
        aesKey
      });
    }

    host.toast.success("Clés déverrouillées avec succès via WebAuthn !");
    await refresh();
  } catch (err) {
    const error = err as Error;
    host.toast.error(`Erreur de déverrouillage : ${error?.message || String(err)}`);
  } finally {
    setBusy(false);
  }
}

  async function initiateUnlock(rec: KeyRecord) {
    const identity = rec.email || host.i18n.t('prompt.unlock_key.fallback_identity');

    const result = await host.ui.prompt({
      title: host.i18n.t('prompt.unlock_key.title'),
      message: `${host.i18n.t('prompt.unlock_key.message_prefix')}${identity}${host.i18n.t('prompt.unlock_key.message_suffix')}`,
      fields: [{ 
        name: 'passphrase', 
        label: host.i18n.t('prompt.unlock_key.passphrase_label'), 
        type: 'password', 
        required: true 
      }]
    });

    if (!result || !result.passphrase) return;

    setBusy(true);
    try {
      const { unlockedPrivateKey, signingKey, decryptionKey, aesKey } = await unlockPrivateKey(rec, result.passphrase);
      
      broadcastUnlockKey({ 
        id: rec.id, 
        unlockedPrivateKey, 
        signingKey, 
        decryptionKey ,
        aesKey: aesKey,
      });
      
      host.toast.success(`Unlocked ${rec.email || 'key'}`);
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(error?.message ? error.message : 'Unlock failed');
    } finally {
      setBusy(false);
    }
  }
  async function handleUploadKey(c: PublicCert) {
    setBusy(true);
    try {
      // @ts-ignore - récupère le texte de la clé publique (ajuste selon ton type exact c.publicKey ou c.armored)
      const armored = c.publicKey || c.armored; 
      if (!armored) throw new Error("Could not find armored public key in storage.");

      const res = await uploadKey(armored);
      host.toast.success(`Key uploaded successfully!`);
      
      if (c.email) {
        await requestVerify(res.token, [c.email]);
        host.toast.info(`Verification email sent to ${c.email}. Please check your inbox.`);
      }
    } catch (err) {
      const error = err as Error;
      host.toast.error(`Upload failed: ${error?.message ? error.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSearchAndImportKey(e?: React.FormEvent) {
    console.log('handleSearchAndImportKey', e);
    if (e) e.preventDefault();
    if (!searchEmail || !searchEmail.includes('@')) return;
    setBusy(true);
    try {
      const { armored, email } = await lookup(searchEmail);
      if (!armored) {
        host.toast.error(`No public key found for ${email} on keys.openpgp.org.`);
        return;
      }
      await importOpenPgpPublicKey(armored);
      host.toast.success(`Public key for ${email} imported successfully!`);
      setSearchEmail('');
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(`Search failed: ${error?.message ? error.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function lock(rec: KeyRecord) {
    broadcastLockKey();
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
    
    broadcastLockKey();
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
    const ok = await host.ui.confirm({
      title: 'Delete Public Key',
      message: `Delete the public key for ${c.email}?`,
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    await deletePublicCert(c.id);
    await refresh();
  }

  async function handleSetDefaultPrivateKey(targetKey: KeyRecord, isChecked: boolean) {
    setBusy(true);
    try {
      await Promise.all(
        keys.map((k) => {
          const isCurrent = k.id === targetKey.id;
          return saveKeyRecord({
            ...k,
            default: isCurrent ? isChecked : (isChecked ? false : k.default)
          });
        })
      );
      
      host.toast.success(
        isChecked 
          ? `Key ${targetKey.email} defined as default for encryption` 
          : `Default key removed`
      );
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(`Erreur : ${error?.message ? error.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' } },
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
        border: 1px solid var(--color-border, #e2e8f0);
        background-color: var(--color-background, #ffffff);
        color: var(--color-foreground, #0f172a);
      }
      .composer-btn:hover {
        background-color: var(--color-accent, #2563eb) !important;
        color: var(--color-accent-foreground, #ffffff) !important;
        opacity: 1 !important;
      }
      .composer-btn:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed;
      }
    `),

    h('style', null, `
      .trash-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.375rem;
        font-weight: 500;
        height: 2.25rem;
        padding: 0 1rem;
        cursor: pointer;
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        background-color: #f000;
      }
      .trash-btn:hover {
        background-color: var(--color-accent, #2563eb) !important;
        opacity: 1 !important;
      }
      .trash-btn:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed;
      }
    `),

    h('style', null, `
      .lock-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.375rem;
        font-weight: 500;
        height: 2.25rem;
        padding: 0 1rem;
        cursor: pointer;
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        background-color: #f000;
        color: var(--color-foreground);
      }
      .lock-btn:hover {
        background-color: var(--color-accent, #2563eb) !important;
        color: var(--color-accent-foreground, #ffffff) !important;
        opacity: 1 !important;
      }
      .lock-btn:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed;
      }
    `),

    h('div', null,
      h('h3', { style: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600 } }, host.i18n.t('settings.private_keys_title')),
      h('p', { style: { margin: '0 0 8px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } },
        host.i18n.t('settings.private_keys_desc')),
      
      keys.length === 0
        ? h('div', { style: { ...card, fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)', marginBottom: '12px' } }, host.i18n.t('settings.no_private_keys'))
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' } },
            keys.some(k => k.webauthn && !unlocked[k.id]) && h('button', {
            type: 'button',
            className: 'composer-btn',
            style: { marginBottom: '8px', border: '1px solid var(--color-accent, #2563eb)', color: 'var(--color-accent, #2563eb)' },
            disabled: busy,
            onClick: handleUnlockAllWithWebAuthn
          }, [
            h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16px', height: '16px', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', style: { marginRight: '8px' } }, [
              h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
              h('circle', { cx: '12', cy: '11', r: '3' }),
              h('path', { d: 'M12 14v4' })
            ]),
            "Déverrouiller les clés avec le Passkey / Biométrie"
          ]),

          ...keys.map((rec) => h('div', { key: rec.id, style: { ...card, display: 'flex', flexDirection: 'column', gap: '10px' } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' } },
              h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '12px' } },
                h('input', {
                  type: 'checkbox',
                  checked: !!rec.default,
                  disabled: busy,
                  onChange: (e) => handleSetDefaultPrivateKey(rec, e.target.checked),
                  style: { cursor: 'pointer', width: '16px', height: '16px', marginTop: '3px' }
                }),
                h('div', null,
                  h('div', { style: { fontWeight: 600, fontSize: '14px' } }, 
                    rec.email || rec.subject || 'OpenPGP User',
                    rec.default && h('span', { style: { marginLeft: '8px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-primary-smooth, #e0f2fe)', color: '#0369a1', fontWeight: 'normal' } }, host.i18n.t('settings.default_badge'))
                  ),
                  h('div', { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' } },
                    `${rec.algorithm} · ${host.i18n.t('settings.key_created')} ${fmtDate(rec.notBefore)}${rec.notAfter ? ` · ${host.i18n.t('settings.key_expires')} ${fmtDate(rec.notAfter)}` : ` · ${host.i18n.t('settings.key_no_expiration')}`}${isExpired(rec.notAfter) ? ` · ${host.i18n.t('settings.key_expired')}` : ''}`),
                  h('div', { style: { fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-muted-foreground, #64748b)', wordBreak: 'break-all' } },
                    rec.fingerprint),
                  h('div', { style: { fontSize: '11px', color: 'var(--color-muted-foreground, #64748b)' } },
                    `${rec.capabilities && rec.capabilities.canSign ? host.i18n.t('settings.key_sign') : ''}${rec.capabilities && rec.capabilities.canSign && rec.capabilities.canEncrypt ? ' · ' : ''}${rec.capabilities && rec.capabilities.canEncrypt ? host.i18n.t('settings.key_encrypt') : ''}`),
                ),
              ),
              h('div', { style: { display: 'flex', gap: '6px', alignItems: 'flex-start' } },
                unlocked[rec.id]
                  ? h('button', {
                      type: 'button',
                      style: { ...btn, color: 'var(--color-foreground)'},
                      className: 'lock-btn',
                      title: host.i18n.t('settings.action.lock'),
                      disabled: busy,
                      onClick: () => lock(rec),
                    },
                      h('svg', {
                        xmlns: 'http://www.w3.org/2000/svg',
                        width: '1rem',
                        height: '1rem',
                        viewBox: '0 -960 960 960',
                        fill: 'currentColor',
                        'aria-hidden': 'true'
                      },
                        h('path', { d: 'M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z' })
                      )
                    )
                  : h('button', {
                      type: 'button',
                      style: { ...btn, color: 'var(--color-foreground)' },
                      className: 'lock-btn',
                      title: host.i18n.t('settings.action.unlock'),
                      disabled: busy,
                      onClick: () => initiateUnlock(rec),
                    },
                      h('svg', {
                        xmlns: 'http://www.w3.org/2000/svg',
                        width: '1rem',
                        height: '1rem',
                        viewBox: '0 -960 960 960',
                        fill: 'currentColor',
                        'aria-hidden': 'true'
                      },
                        h('path', { d: 'M240-160h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM240-160v-400 400Zm0 80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h280v-80q0-83 58.5-141.5T720-920q83 0 141.5 58.5T920-720h-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80h120q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Z' })
                      )
                    ),

                h('button', {
                  type: 'button',
                  className: 'lock-btn',
                  style: { 
                    ...btn, 
                    color: rec.webauthn ? 'var(--color-success, #16a34a)' : 'var(--color-muted-foreground)' 
                  },
                  title: rec.webauthn ? "Biométrie Ok" : "Activer le déverrouillage par empreinte/Bitwarden",
                  disabled: busy,
                  onClick: () => handleLinkWebAuthn(rec)
                }, 
                  h('svg', { 
                    xmlns: 'http://www.w3.org/2000/svg', 
                    width: '1rem', 
                    height: '1rem', 
                    viewBox: '0 0 24 24', 
                    fill: 'none', 
                    stroke: 'currentColor', 
                    strokeWidth: '2',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round'
                  }, [
                    h('path', { d: 'M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4c.4-.4.6-.9.6-1.4V11c0-2.8-2.2-5-5-5S7 8.2 7 11v1.6c0 .5-.2 1-.6 1.4L2 18z' }),
                    h('circle', { cx: '17', cy: '7', r: '1' })
                  ])
                ),
                h('button', {
                  type: 'button',
                  style: { ...btn, color: 'var(--color-destructive, #dc2626)', borderColor: 'var(--color-destructive, #dc2626)' },
                  className: 'trash-btn',
                  title: host.i18n.t('settings.action.delete'),
                  disabled: busy, 
                  onClick: () => removeKey(rec), 
                }, 
                  h('svg', { 
                    xmlns: 'http://www.w3.org/2000/svg', 
                    width: '1rem', 
                    height: '1rem', 
                    viewBox: '0 0 24 24', 
                    fill: 'none', 
                    stroke: 'currentColor', 
                    strokeWidth: '2', 
                    strokeLinecap: 'round', 
                    strokeLinejoin: 'round',
                    'aria-hidden': 'true'
                  }, [
                    h('path', { d: 'M10 11v6' }),
                    h('path', { d: 'M14 11v6' }),
                    h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }),
                    h('path', { d: 'M3 6h18' }),
                    h('path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
                  ])
                )
              )
            )
          )),
        ),

      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' } },
        h('input', { 
          ref: fileRef, 
          type: 'file', 
          accept: '.asc,.key,.pgp', 
          style: { display: 'none' },
          onChange: handleFileChange 
        }),
        h('button', { 
          type: 'button', 
          className: 'composer-btn',
          style: { width: '100%' },
          disabled: busy, 
          onClick: () => fileRef.current && fileRef.current.click() 
        }, [
          h('svg', { 
            xmlns: 'http://www.w3.org/2000/svg', 
            width: '1rem', 
            height: '1rem', 
            viewBox: '0 0 24 24', 
            fill: 'none', 
            stroke: 'currentColor', 
            strokeWidth: '2', 
            strokeLinecap: 'round', 
            strokeLinejoin: 'round', 
            style: { marginRight: '0.5rem' },
            'aria-hidden': 'true' 
          }, [
            h('path', { d: 'M5 12h14' }),
            h('path', { d: 'M12 5v14' })
          ]),
          host.i18n.t('settings.add_private_key')
        ])
      ),
    ),

    h('div', null,
      h('h3', { style: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600 } }, host.i18n.t('settings.public_keys_title')),
      h('p', { style: { margin: '0 0 8px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } },
        host.i18n.t('settings.public_keys_desc')),

      certs.length === 0
        ? h('div', { style: { ...card, fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)', marginBottom: '12px' } }, host.i18n.t('settings.no_public_keys'))
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' } },
          certs.map((c) => h('div', { key: c.id, style: { ...card, display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' } },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
              h('div', null,
                h('div', { style: { fontWeight: 600, fontSize: '13px' } }, 
                  c.email || c.subject,
                  c.source === 'private-key' && h('span', { style: { marginLeft: '8px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 'normal' } }, host.i18n.t('settings.own_key_badge'))
                ),
                h('div', { style: { fontSize: '11px', color: 'var(--color-muted-foreground, #64748b)' } },
                  `${c.source === 'private-key' ? host.i18n.t('settings.linked_key') : c.source} · ${host.i18n.t('settings.key_expires')} ${fmtDate(c.notAfter)}${isExpired(c.notAfter) ? ` · ${host.i18n.t('settings.key_expired')}` : ''}`),
              )
            ),
            c.source !== 'private-key' 
              ? h('button', {
                  type: 'button',
                  style: { ...btn, color: 'var(--color-destructive, #dc2626)', borderColor: 'var(--color-destructive, #dc2626)' },
                  className: 'trash-btn',
                  title: host.i18n.t('settings.action.delete'),
                  disabled: busy, 
                  onClick: () => removeCert(c), 
                }, 
                  h('svg', { 
                    xmlns: 'http://www.w3.org/2000/svg', 
                    width: '1rem', 
                    height: '1rem', 
                    viewBox: '0 0 24 24', 
                    fill: 'none', 
                    stroke: 'currentColor', 
                    strokeWidth: '2', 
                    strokeLinecap: 'round', 
                    strokeLinejoin: 'round',
                    'aria-hidden': 'true'
                  }, [
                    h('path', { d: 'M10 11v6' }),
                    h('path', { d: 'M14 11v6' }),
                    h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }),
                    h('path', { d: 'M3 6h18' }),
                    h('path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
                  ])
                )
              : h('button', {
                  type: 'button',
                  className: 'lock-btn',
                  style: { ...btn, color: 'var(--color-foreground)'},
                  title: 'Upload to keys.openpgp.org',
                  disabled: busy,
                  onClick: () => handleUploadKey(c)
                }, [
                  h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14px', height: '14px', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [
                    h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }), h('polyline', { points: '17 8 12 3 7 8' }), h('line', { x1: '12', y1: '3', x2: '12', y2: '15' })
                  ]),
                ]),
              
          )),
        ),
        
      h('div', null,
        h('input', { 
          ref: certFileRef, 
          type: 'file', 
          accept: '.asc,.key,.pub', 
          style: { display: 'none' },
          onChange: importCertFile
        }),
        h('button', { 
          type: 'button', 
          className: 'composer-btn',
          style: { width: '100%' },
          disabled: busy, 
          onClick: () => certFileRef.current && certFileRef.current.click() 
        }, [
          h('svg', { 
            xmlns: 'http://www.w3.org/2000/svg', 
            width: '1rem', 
            height: '1rem', 
            viewBox: '0 0 24 24', 
            fill: 'none', 
            stroke: 'currentColor', 
            strokeWidth: '2', 
            strokeLinecap: 'round', 
            strokeLinejoin: 'round', 
            style: { marginRight: '0.5rem' },
            'aria-hidden': 'true' 
          }, [
            h('path', { d: 'M5 12h14' }),
            h('path', { d: 'M12 5v14' })
          ]),
          host.i18n.t('settings.add_public_key')
        ])
      ),
      h('div', { style: { ...card, marginTop: '16px', backgroundColor: 'var(--color-muted, #f8fafc)' } },
      h('h4', { style: { margin: '0 0 6px', fontSize: '14px', fontWeight: 600 } }, 'Lookup & Import Key from OpenPGP Directory'),
      h('p', { style: { margin: '0 0 10px', fontSize: '12px', color: 'var(--color-muted-foreground)' } }, 'Find a contact\'s public key by their email address via keys.openpgp.org.'),
      h('div', { style: { display: 'flex', gap: '8px' } },
        h('input', {
          type: 'email',
          style: {
            height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.375rem', flex: 1,
            border: '1px solid var(--color-border, #e2e8f0)', backgroundColor: 'var(--color-background, #ffffff)',
            color: 'var(--color-foreground, #0f172a)', outline: 'none'
          },
          placeholder: 'contact@example.com',
          value: searchEmail,
          onChange: (e) => setSearchEmail((e.target as HTMLInputElement).value),
          disabled: busy,
          required: true
        }),
        h('button', {
          className: 'composer-btn',
          disabled: busy || !searchEmail,
          onClick: () => handleSearchAndImportKey(),
          style: { padding: '0 12px' }
        }, [
          h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16px', height: '16px', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', style: { marginRight: '6px' } }, [
            h('circle', { cx: '11', cy: '11', r: '8' }), h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
          ]),
          'Search'
        ])
      )
    )
    ),
  );
}