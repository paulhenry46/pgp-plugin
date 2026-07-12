import host from '@plugin-host';
import React from 'react'
const h = React.createElement;
const { useState, useEffect, useCallback, useRef } = React;
import {
  saveKeyRecord, listKeyRecords, deleteKeyRecord, listPublicCerts, deletePublicCert,
  KeyRecord, PublicCert
} from '../storage.ts';

import { importOpenPgpPrivateKey, importOpenPgpPublicKey, unlockPrivateKey } from '../pgp/import.ts';
import { btn, fmtDate, isExpired, card } from './shared.ts';
import { isCapable, NOT_PRIVILEGED_MSG } from '../index.tsx';

import { 
  fetchKeyFromBackground, 
  broadcastUnlockKey, 
  broadcastLockKey,
  subscribeToKeyUpdates
} from '../pgp/session-broadcast.ts';

export function SettingsSection() {
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
      const { unlockedPrivateKey, signingKey, decryptionKey, aesKey } = await unlockPrivateKey(rec, unlockPassphrase);
      
      broadcastUnlockKey({ 
        id: rec.id, 
        unlockedPrivateKey, 
        signingKey, 
        decryptionKey ,
        aesKey: aesKey,
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
          ? `Clé de ${targetKey.email} définie par défaut pour le chiffrement` 
          : `Clé par défaut retirée`
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
    // Injection des styles CSS globaux
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

    h('div', null,
      h('h3', { style: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600 } }, 'Your OpenPGP keys'),
      h('p', { style: { margin: '0 0 8px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } },
        'Import an armored OpenPGP private key (.asc/.key). The key remains encrypted locally in your browser sandbox.'),
      
      keys.length === 0
        ? h('div', { style: { ...card, fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)', marginBottom: '12px' } }, 'No keys imported yet.')
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' } },
          keys.map((rec) => h('div', { key: rec.id, style: { ...card, display: 'flex', flexDirection: 'column', gap: '10px' } },
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
                    rec.default && h('span', { style: { marginLeft: '8px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-primary-smooth, #e0f2fe)', color: '#0369a1', fontWeight: 'normal' } }, 'Par défaut')
                  ),
                  h('div', { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' } },
                    `${rec.algorithm} · created ${fmtDate(rec.notBefore)}${rec.notAfter ? ` · expires ${fmtDate(rec.notAfter)}` : ' · no expiration'}${isExpired(rec.notAfter) ? ' · EXPIRED' : ''}`),
                  h('div', { style: { fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-muted-foreground, #64748b)', wordBreak: 'break-all' } },
                    rec.fingerprint),
                  h('div', { style: { fontSize: '11px', color: 'var(--color-muted-foreground, #64748b)' } },
                    `${rec.capabilities && rec.capabilities.canSign ? 'sign' : ''}${rec.capabilities && rec.capabilities.canSign && rec.capabilities.canEncrypt ? ' · ' : ''}${rec.capabilities && rec.capabilities.canEncrypt ? 'encrypt' : ''}`),
                ),
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
            
            unlockingKeyId === rec.id && h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', borderTop: '1px dashed var(--color-border, #e2e8f0)', paddingTop: '8px' } },
              h('input', {
                type: 'password',
                placeholder: 'Enter passphrase to unlock...',
                value: unlockPassphrase,
                disabled: busy,
                onChange: (e) => setUnlockPassphrase(e.target.value),
                style: { padding: '4px 8px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--color-border, #e2e8f0)', flex: 1, maxWidth: '240px' }
              }),
              h('button', { type: 'button', style: btn, disabled: busy, onClick: () => confirmUnlock(rec) }, 'OK'),
              h('button', { type: 'button', style: btn, disabled: busy, onClick: () => setUnlockingKeyId(null) }, 'Cancel')
            )
          )),
        ),

      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' } },
        h('input', { 
          ref: fileRef, 
          type: 'file', 
          accept: '.asc,.key,.pgp', 
          style: { display: 'none' }, // Hidden just like the public key input
          onChange: handleFileChange 
        }),
        h('button', { 
          type: 'button', 
          className: 'composer-btn',
          style: { width: '100%' }, // Uniform full-width
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
          'Import private key'
        ]),
        
        hasPrivateFile && h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' } },
          h('input', {
            type: 'password',
            placeholder: 'Enter OpenPGP key passphrase...',
            value: passphrase,
            disabled: busy,
            onChange: (e) => setPassphrase(e.target.value),
            style: { padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--color-border, #e2e8f0)', flex: 1, maxWidth: '320px' }
          }),
          h('button', { type: 'button', style: btn, disabled: busy, onClick: importKeyFile }, 'Submit Key')
        )
      ),
    ),

    h('div', null,
      h('h3', { style: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600 } }, 'Recipient public keys'),
      h('p', { style: { margin: '0 0 8px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' } },
        'Public keys (ASCII Armored) of contacts you send encrypted mail to.'),

      certs.length === 0
        ? h('div', { style: { ...card, fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)', marginBottom: '12px' } }, 'No recipient public keys collected.')
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' } },
          certs.map((c) => h('div', { key: c.id, style: { ...card, display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' } },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
              h('div', null,
                h('div', { style: { fontWeight: 600, fontSize: '13px' } }, 
                  c.email || c.subject,
                  c.source === 'private-key' && h('span', { style: { marginLeft: '8px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 'normal' } }, 'Own key')
                ),
                h('div', { style: { fontSize: '11px', color: 'var(--color-muted-foreground, #64748b)' } },
                  `${c.source === 'private-key' ? 'Linked' : c.source} · expires ${fmtDate(c.notAfter)}${isExpired(c.notAfter) ? ' · EXPIRED' : ''}`),
              )
            ),
            c.source !== 'private-key' 
              ? h('button', { type: 'button', style: { ...btn, color: 'var(--color-destructive, #dc2626)' }, disabled: busy, onClick: () => removeCert(c) }, 'Remove')
              : h('div', { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)', fontStyle: 'italic', paddingRight: '8px' } }, 'Linked to private key')
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
          'Add a public key'
        ])
      ),
    ),
  );
}