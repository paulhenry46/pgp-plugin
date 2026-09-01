import React from 'react'
const h = React.createElement;
import { useSettingsLogic } from './components/settings/useSettingsLogic.ts';
import { BackupSection } from './components/settings/BackupSection.tsx';

import { OnboardingFlow } from './onboarding.tsx';
import { PrivateKeysSection } from './components/settings/PrivateKeysList.tsx';
import { PublicKeysSection } from './components/settings/PublicKeysList.tsx';
import { ProModeToggle } from './components/settings/AccountSelector.tsx';
import { AccountState } from './components/settings/AccountState.tsx';

export function SettingsSection() {
const {
  accounts,
    selectedAccountId,
    selectAccount,
    keys, unlocked, persisted, busy,
    fileRef, certFileRef, jsonFileRef,
    searchEmail, setSearchEmail, gen, setGen,
    refresh,
    handleFileChange,
    initiateUnlock,
    handleGenerateKey,
    handleLinkWebAuthn,
    handleUnlockAllWithWebAuthn,
    initiateRecoveryUnlock,
    handleUploadKey,
    handleSearchAndImportKey,
    importCertFile,
    lock,
    removeKey,
    handleSetDefaultPrivateKey,
    handleSetServerSideEncryption,
    handleExportJSON,
    handleImportJSON,
    changePass,
    handleDownloadKey,
    removeWebAuthnLink,
    handleSetMainPrivateKey,
    handleExportPrivateKey
  } = useSettingsLogic();

  if (keys.length === 0) {
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' } },
      // We still need the styles loaded for the onboarding component buttons
      h('style', null, `
        .composer-btn {
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 0.375rem; font-weight: 500; height: 2.25rem; padding: 0 1rem;
          cursor: pointer; transition: all 150ms; border: 1px solid var(--color-border, #e2e8f0);
          background-color: var(--color-background, #ffffff); color: var(--color-foreground, #0f172a);
        }
        .composer-btn:hover { background-color: var(--color-accent, #2563eb) !important; color: var(--color-accent-foreground, #ffffff) !important; opacity: 1 !important; }
        .composer-btn:disabled { opacity: 0.5 !important; cursor: not-allowed; }
      `),
      h('input', { ref: fileRef, type: 'file', accept: '.asc,.key,.pgp', style: { display: 'none' }, onChange: handleFileChange }),
      h('input', { ref: jsonFileRef, type: 'file', accept: '.json', style: { display: 'none' }, onChange: handleImportJSON }),
      h(OnboardingFlow, {
        busy: busy,
        onImportClick: () => fileRef.current && fileRef.current.click(),
        onJsonImport: () => jsonFileRef.current && jsonFileRef.current.click(),
        onGenerate: (name, email, pass) => {
          // Fire the modified generation logic
          void handleGenerateKey({ name, email, pass });
        }
      })
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
      <style>{`
        .composer-btn {
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 0.375rem; font-weight: 500; height: 2.25rem; padding: 0 1rem;
          cursor: pointer; transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
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
        .trash-btn {
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 0.375rem; font-weight: 500; height: 2.25rem; padding: 0 1rem;
          cursor: pointer; transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
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
        .lock-btn {
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 0.375rem; font-weight: 500; height: 2.25rem; padding: 0 1rem;
          cursor: pointer; transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          background-color: #f000; color: var(--color-foreground);
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
        .menu-dropdown-container {
          position: relative;
          display: inline-block;
        }

        /* Bouton déclencheur "dots" */
        .menu-dots-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          color: var(--color-foreground, #000);
          transition: background-color 150ms ease;
        }

        .menu-dots-btn:hover {
          background-color: var(--color-muted, #f1f5f9);
        }

        .menu-dots-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Popover du Menu */
        .menu-popover {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 4px;
          z-index: 50;
          min-width: 200px;
          background-color: var(--color-background, #ffffff);
          border-radius: 6px;
          border: 1px solid var(--color-border, #e2e8f0);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          padding: 4px 0;
        }

        /* En-tête du Menu */
        .menu-header {
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-muted-foreground, #64748b);
          border-bottom: 1px solid var(--color-border, #e2e8f0);
        }

        /* Items/Boutons du Menu */
        .menu-item {
          width: 100%;
          padding: 6px 12px;
          font-size: 14px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--color-foreground, #0f172a);
          transition: background-color 150ms ease, color 150ms ease;
        }

        .menu-item:hover:not(:disabled),
        .menu-item:focus:not(:disabled) {
          outline: none;
          background-color: var(--color-muted, #f1f5f9);
        }

        .menu-item:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Variante Destructive (Ex: Supprimer) */
        .menu-item-destructive {
          color: var(--color-destructive, #dc2626);
        }

        .menu-item-destructive:hover:not(:disabled) {
          background-color: var(--color-destructive-muted, #fef2f2);
        }

        /* Icônes et Séparateurs */
        .menu-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .menu-separator {
          height: 1px;
          background-color: var(--color-border, #e2e8f0);
          margin: 4px 0;
        }
      `}</style>

      <ProModeToggle
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={selectAccount}
      />

      <AccountState 
      accountId={selectedAccountId}
      />

      <PrivateKeysSection
        keys={keys}
        unlocked={unlocked}
        persisted={persisted}
        busy={busy}
        fileRef={fileRef}
        gen={gen}
        setGen={setGen}
        onUnlockAllWebAuthn={handleUnlockAllWithWebAuthn}
        onSetDefaultKey={handleSetDefaultPrivateKey}
        onSetServerSideEncryption={handleSetServerSideEncryption}
        onLock={lock}
        onUnlock={initiateUnlock}
        onRecoveryUnlock={initiateRecoveryUnlock}
        onLinkWebAuthn={handleLinkWebAuthn}
        onRemoveKey={removeKey}
        onFileChange={handleFileChange}
        onGenerateKey={() => handleGenerateKey()}
        onChangePass={changePass}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onremoveWebAuthnLink={removeWebAuthnLink}
        onUploadKey={handleUploadKey}
        onDownloadKey={handleDownloadKey}
        onDownloadPrivateKey={handleExportPrivateKey}
        onSetMainPrivateKey={handleSetMainPrivateKey}
      />

      <PublicKeysSection
        busy={busy}
        certFileRef={certFileRef}
        searchEmail={searchEmail}
        setSearchEmail={setSearchEmail}
        onImportCertFile={importCertFile}
        onSearchAndImportKey={handleSearchAndImportKey}
      />

      <BackupSection
        busy={busy}
        jsonFileRef={jsonFileRef}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        accountId={selectedAccountId}
      />
    </div>
  );
}