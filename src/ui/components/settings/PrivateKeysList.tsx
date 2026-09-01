// src/components/settings/PrivateKeysSection.tsx
import React, { RefObject } from 'react';
import host from '@plugin-host';
import { KeyRecord } from '../../../storage.ts';
import { btn, fmtDate, isExpired, card } from '../../shared.ts';
 import { useState } from 'react';
import { AccountEntry } from '../../../util.ts';
interface PrivateKeysSectionProps {
  keys: KeyRecord[];
  unlocked: Record<string, boolean>;
  persisted: Record<string, boolean>;
  busy: boolean;
  selectedAccountId: string | undefined;
  accounts: AccountEntry[];
  fileRef: RefObject<HTMLInputElement | null>;
  gen: { open: boolean; name: string; email: string; pass: string };
  setGen: React.Dispatch<React.SetStateAction<{ open: boolean; name: string; email: string; pass: string }>>;
  onUnlockAllWebAuthn: () => void;
  onSetDefaultKey: (targetKey: KeyRecord) => void;
  onSetServerSideEncryption: (key: KeyRecord) => void;
  onLock: (rec: KeyRecord) => void;
  onUnlock: (rec: KeyRecord) => void;
  onRecoveryUnlock: (recId: string) => void;
  onLinkWebAuthn: (rec: KeyRecord) => void;
  onremoveWebAuthnLink: (rec: KeyRecord) => void;
  onRemoveKey: (rec: KeyRecord) => void;
  onFileChange: () => void;
  onGenerateKey: () => void;
  onChangePass: (rec: KeyRecord) => void;
  onUploadKey: (c: KeyRecord) => void;
  onDownloadKey: (c: KeyRecord) => void;
  onDownloadPrivateKey: (c: KeyRecord) => void;
  onSetMainPrivateKey: (c: KeyRecord) => void;
}

export function PrivateKeysSection({
  keys,
  unlocked,
  persisted,
  busy,
  fileRef,
  gen,
  setGen,
  onUnlockAllWebAuthn,
  onSetDefaultKey,
  onSetServerSideEncryption,
  onLock,
  onUnlock,
  onRecoveryUnlock,
  onLinkWebAuthn,
  onRemoveKey,
  onFileChange,
  onGenerateKey,
  onChangePass,
  selectedAccountId,
  accounts,
  onremoveWebAuthnLink,
  onUploadKey,
  onDownloadKey,
  onDownloadPrivateKey,
  onSetMainPrivateKey
}: PrivateKeysSectionProps) {
  const visibleKeys = keys.filter((rec) => !rec.recovery);
  const hasWebAuthnLockedKeys = keys.some((k) => k.webauthn && !unlocked[k.id]);
  const [openMenuId, setOpenMenuId] = useState<null | string>(null);

  return (
    <div>
      <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600 }}>
        {host.i18n.t('settings.private_keys_title')}
      </h3>
      <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)' }}>
        {host.i18n.t('settings.private_keys_desc')}
      </p>

      {/* État vide ou liste des clés */}
      {keys.length === 0 ? (
        <div style={{ ...card, fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)', marginBottom: '12px' }}>
          {host.i18n.t('settings.no_private_keys')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {/* Bouton pour tout déverrouiller via WebAuthn */}
          {hasWebAuthnLockedKeys && (
            <button
              type="button"
              className="composer-btn"
              style={{ width: '100%' }}
              disabled={busy}
              onClick={onUnlockAllWebAuthn}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="16px"
                width="16px"
                viewBox="0 -960 960 960"
                fill="currentColor"
                style={{ marginRight: '8px' }}
              >
                <path d="M444-360h72q9 0 15.5-7.5T536-384l-19-105q20-10 31.5-29t11.5-42q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 23 11.5 42t31.5 29l-19 105q-2 9 4.5 16.5T444-360Zm23 275q-6-1-12-3-135-45-215-166.5T160-516v-189q0-25 14.5-45t37.5-29l240-90q14-5 28-5t28 5l240 90q23 9 37.5 29t14.5 45v189q0 140-80 261.5T505-88q-6 2-12 3t-13 1q-7 0-13-1Zm13-79q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z" />
              </svg>
              {host.i18n.t('settings.action.unlock_all_webauthn')}
            </button>
          )}

          {/* Liste des cartes de clés privées */}
          {visibleKeys.map((rec) => { 
              const accentColor = selectedAccountId == undefined 
              ? accounts.find((a) => a.id === rec.accountId)?.avatarColor
              : undefined;

              const borderColor = accentColor || 'var(--color-border, #e2e8f0)';
            return (
            <div key={rec.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '10px', borderColor: borderColor }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px',display: 'inline-flex', alignItems: 'center', gap: '8px'  }}>
                      {rec.email || rec.subject || 'OpenPGP User'}
                      {persisted[rec.id] && (
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: accentColor || 'var(--color-warning, #fffbeb)', color: 'var(--color-warning-foreground, #92400e)', fontWeight: 'normal' }}>
                          {host.i18n.t('settings.persisted_badge')}
                        </span>
                      )}
                      <div style={{color: accentColor || 'var(--color-success, #e0f2fe)', display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                      {rec.default && (
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                          <path d="M480-269 314-169q-11 7-23 6t-21-8q-9-7-14-17.5t-2-23.5l44-189-147-127q-10-9-12.5-20.5T140-571q4-11 12-18t22-9l194-17 75-178q5-12 15.5-18t21.5-6q11 0 21.5 6t15.5 18l75 178 194 17q14 2 22 9t12 18q4 11 1.5 22.5T809-528L662-401l44 189q3 13-2 23.5T690-171q-9 7-21 8t-23-6L480-269Z">
                            <title>{host.i18n.t('settings.default_badge')}</title>
                          </path>
                        </svg>
                       
                      )}
                      {rec.main !== false && (
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                          <path d="M160-120q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm544-528 56-56-56-56-56 56 56 56Z">
                            <title>{host.i18n.t('settings.main_badge')}</title>
                          </path>
                        </svg>
                        
                      )}
                      {rec.serverSide && (
                       <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="M260-160q-91 0-155.5-63T40-377q0-78 47-139t123-78q25-92 100-149t170-57q98 0 172.5 58.5T751-592q3 13-4.5 23T725-557q-72 13-118.5 68.5T560-360v160q0 17-11.5 28.5T520-160H260Zm420 0q-17 0-28.5-11.5T640-200v-120q0-17 11.5-28.5T680-360v-40q0-33 23.5-56.5T760-480q33 0 56.5 23.5T840-400v40q17 0 28.5 11.5T880-320v120q0 17-11.5 28.5T840-160H680Zm40-200h80v-40q0-17-11.5-28.5T760-440q-17 0-28.5 11.5T720-400v40Z">
                          <title>{host.i18n.t('settings.server_side_badge')}</title>
                        </path>
                       </svg>
                        
                      )}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' }}>
                      {`${rec.algorithm} · ${host.i18n.t('settings.key_created')} ${fmtDate(rec.notBefore)}${rec.notAfter ? ` · ${host.i18n.t('settings.key_expires')} ${fmtDate(rec.notAfter)}` : ` · ${host.i18n.t('settings.key_no_expiration')}`}${isExpired(rec.notAfter) ? ` · ${host.i18n.t('settings.key_expired')}` : ''}`}
                    </div>
                    
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-muted-foreground, #64748b)', wordBreak: 'break-all' }}>
                      {rec.fingerprint}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--color-muted-foreground, #64748b)' }}>
                      {`${rec.capabilities && rec.capabilities.canSign ? host.i18n.t('settings.key_sign') : ''}${rec.capabilities && rec.capabilities.canSign && rec.capabilities.canEncrypt ? ' · ' : ''}${rec.capabilities && rec.capabilities.canEncrypt ? host.i18n.t('settings.key_encrypt') : ''}`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  
                  {unlocked[rec.id] ? (
                    <>
                      <button
                        type="button"
                        style={{ ...btn, color: 'var(--color-foreground)' }}
                        className="lock-btn"
                        title={host.i18n.t('settings.action.lock')}
                        disabled={busy}
                        onClick={() => onLock(rec)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
                          <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      style={{ ...btn, color: 'var(--color-foreground)' }}
                      className="lock-btn"
                      title={host.i18n.t('settings.action.unlock')}
                      disabled={busy}
                      onClick={() => onUnlock(rec)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
                        <path d="M240-160h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM240-160v-400 400Zm0 80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h280v-80q0-83 58.5-141.5T720-920q83 0 141.5 58.5T920-720h-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80h120q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Z" />
                      </svg>
                    </button>
                  )}

                  <div className="menu-dropdown-container">
                    <button
                      type="button"
                      style={{ ...btn, color: 'var(--color-foreground)' }}
                      className="lock-btn"
                      disabled={busy}
                      aria-haspopup="true"
                      aria-expanded={openMenuId === rec.id}
                      onClick={() => setOpenMenuId(openMenuId === rec.id ? null : rec.id)}
                    >
                      {/*  (More options icon) */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>

                    {openMenuId === rec.id && (
                      <div className="menu-popover" role="menu" aria-orientation="vertical">
                        <div className="menu-header">
                          <span>{host.i18n.t('settings.action.options') || 'Options'}</span>
                        </div>

                        {!rec.serverSide && (
                          <button
                            type="button"
                            role="menuitem"
                            className="menu-item"
                            disabled={busy}
                            onClick={() => {
                              onSetServerSideEncryption(rec);
                              setOpenMenuId(null);
                            }}
                          >
                            <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 -960 960 960" width="1rem" fill="currentColor"><path d="M260-160q-91 0-155.5-63T40-377q0-78 47-139t123-78q25-92 100-149t170-57q98 0 172.5 58.5T751-592q3 13-4.5 23T725-557q-72 13-118.5 68.5T560-360v160q0 17-11.5 28.5T520-160H260Zm420 0q-17 0-28.5-11.5T640-200v-120q0-17 11.5-28.5T680-360v-40q0-33 23.5-56.5T760-480q33 0 56.5 23.5T840-400v40q17 0 28.5 11.5T880-320v120q0 17-11.5 28.5T840-160H680Zm40-200h80v-40q0-17-11.5-28.5T760-440q-17 0-28.5 11.5T720-400v40Z"/></svg>
                            <span>{host.i18n.t('settings.action.upload_server')}</span>
                          </button>
                        )}

                        {/* Recovery */}
                        {!unlocked[rec.id] && rec.recoverable && (
                          <button
                            type="button"
                            role="menuitem"
                            className="menu-item"
                            disabled={busy}
                            onClick={() => {
                              onRecoveryUnlock(rec.id);
                              setOpenMenuId(null);
                            }}
                          >
                            <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
                              <path d="M420-440v60q0 17 11.5 28.5T460-340h40q17 0 28.5-11.5T540-380v-60h60q17 0 28.5-11.5T640-480v-40q0-17-11.5-28.5T600-560h-60v-60q0-17-11.5-28.5T500-660h-40q-17 0-28.5 11.5T420-620v60h-60q-17 0-28.5 11.5T320-520v40q0 17 11.5 28.5T360-440h60Zm47 355q-6-1-12-3-135-45-215-166.5T160-516v-189q0-25 14.5-45t37.5-29l240-90q14-5 28-5t28 5l240 90q23 9 37.5 29t14.5 45v189q0 140-80 261.5T505-88q-6 2-12 3t-13 1q-7 0-13-1Zm13-79q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z" />
                            </svg>
                            <span>{host.i18n.t('settings.action.unlock')} (Recovery)</span>
                          </button>
                        )}
                        {unlocked[rec.id] && (
                          <button
                            type="button"
                            role="menuitem"
                            className="menu-item"
                            disabled={busy}
                            onClick={() => {
                              onChangePass(rec);
                              setOpenMenuId(null);
                            }}
                          >
                            <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 -960 960 960" width="1rem" fill="currentColor"><path d="M160-160v-80h109q-51-44-80-106t-29-134q0-112 68-197.5T400-790v84q-70 25-115 86.5T240-480q0 54 21.5 99.5T320-302v-98h80v240H160Zm560-320q0-51-20.5-95.5T640-658v98h-80v-240h240v80H691q59 53 83.5 113.5T800-480h-80ZM640-80q-17 0-28.5-11.5T600-120v-120q0-17 11.5-28.5T640-280v-40q0-33 23.5-56.5T720-400q33 0 56.5 23.5T800-320v40q17 0 28.5 11.5T840-240v120q0 17-11.5 28.5T800-80H640Zm40-200h80v-40q0-17-11.5-28.5T720-360q-17 0-28.5 11.5T680-320v40Z"/></svg>
                      
                            <span>{host.i18n.t('settings.action.change_passphrase')}</span>
                          </button>
                        )}
                        {/* Download / Upload Public key*/}
                        <button
                            type="button"
                            role="menuitem"
                            className="menu-item"
                            disabled={busy}
                            onClick={() => {
                              onUploadKey(rec);
                              setOpenMenuId(null);
                            }}
                          >
                            <svg className="menu-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="1rem"
                    height="1rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                            <span>{host.i18n.t('settings.action.upload_public_key')}</span>
                          </button>
                        
                        <button
                            type="button"
                            role="menuitem"
                            className="menu-item"
                            disabled={busy}
                            onClick={() => {
                              onDownloadKey(rec);
                              setOpenMenuId(null);
                            }}
                          >
                  <svg className="menu-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1rem"
                  height="1rem"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>

                            <span>{host.i18n.t('settings.action.download_public_key')}</span>
                          </button>
                <button
                            type="button"
                            role="menuitem"
                            className="menu-item"
                            disabled={busy}
                            onClick={() => {
                              onDownloadPrivateKey(rec);
                              setOpenMenuId(null);
                            }}
                          >
                  <svg className="menu-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1rem"
                  height="1rem"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>

                            <span>{host.i18n.t('settings.action.download_private_key')}</span>
                          </button>

                        {!rec.default && (
                        <button
                          type="button"
                          role="menuitem"
                          className="menu-item"
                          disabled={busy}
                          onClick={() => {
                            onSetDefaultKey(rec);
                            setOpenMenuId(null);
                          }}
                        >
                          <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 -960 960 960" width="1rem" fill="currentColor"><path d="M480-269 314-169q-11 7-23 6t-21-8q-9-7-14-17.5t-2-23.5l44-189-147-127q-10-9-12.5-20.5T140-571q4-11 12-18t22-9l194-17 75-178q5-12 15.5-18t21.5-6q11 0 21.5 6t15.5 18l75 178 194 17q14 2 22 9t12 18q4 11 1.5 22.5T809-528L662-401l44 189q3 13-2 23.5T690-171q-9 7-21 8t-23-6L480-269Z"/></svg>
                          <span>{host.i18n.t('settings.action.make_default')}</span>
                        </button>)}

                        {rec.main === false && (
                        <button
                          type="button"
                          role="menuitem"
                          className="menu-item"
                          disabled={busy}
                          onClick={() => {
                            onSetMainPrivateKey(rec);
                            setOpenMenuId(null);
                          }}
                        >
                          <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 -960 960 960" width="1rem" fill="currentColor"><path d="M160-120q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm544-528 56-56-56-56-56 56 56 56Z"/></svg>
                          <span>{host.i18n.t('settings.action.make_main')}</span>
                        </button>)}
                        

                        {/* WebAuthn */}
                        {!rec.webauthn && (
                        <button
                          type="button"
                          role="menuitem"
                          className="menu-item"
                          disabled={busy}
                          onClick={() => {
                            onLinkWebAuthn(rec);
                            setOpenMenuId(null);
                          }}
                        >
                          <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
                            <path d="M223.5-423.5Q200-447 200-480t23.5-56.5Q247-560 280-560t56.5 23.5Q360-513 360-480t-23.5 56.5Q313-400 280-400t-56.5-23.5ZM280-240q-100 0-170-70T40-480q0-100 70-170t170-70q67 0 121.5 33t86.5 87h335q8 0 15.5 3t13.5 9l80 80q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L805-325q-5 5-12 8t-14 4q-7 1-14-1t-13-7l-52-39-57 43q-5 4-11 6t-12 2q-6 0-12.5-2t-11.5-6l-61-43h-47q-32 54-86.5 87T280-240Zm0-80q56 0 98.5-34t56.5-86h125l58 41v.5-.5l82-61 71 55 75-75h-.5.5l-40-40v-.5.5H435q-14-52-56.5-86T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Z" />
                          </svg>
                          <span>{host.i18n.t('settings.action.link_webauthn')}</span>
                        </button>)}

                        {rec.webauthn && (
                        <button
                          type="button"
                          role="menuitem"
                          className="menu-item"
                          disabled={busy}
                          onClick={() => {
                            onremoveWebAuthnLink(rec);
                            setOpenMenuId(null);
                          }}
                        >
                          <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
                            <path d="M223.5-423.5Q200-447 200-480t23.5-56.5Q247-560 280-560t56.5 23.5Q360-513 360-480t-23.5 56.5Q313-400 280-400t-56.5-23.5ZM280-240q-100 0-170-70T40-480q0-100 70-170t170-70q67 0 121.5 33t86.5 87h335q8 0 15.5 3t13.5 9l80 80q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L805-325q-5 5-12 8t-14 4q-7 1-14-1t-13-7l-52-39-57 43q-5 4-11 6t-12 2q-6 0-12.5-2t-11.5-6l-61-43h-47q-32 54-86.5 87T280-240Zm0-80q56 0 98.5-34t56.5-86h125l58 41v.5-.5l82-61 71 55 75-75h-.5.5l-40-40v-.5.5H435q-14-52-56.5-86T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Z" />
                          </svg>
                          <span>{host.i18n.t('settings.action.remove_webauthn')}</span>
                        </button>)}

                        <div className="menu-separator" role="separator"></div>

                        {/* Delete / Suppression */}
                        <button
                          type="button"
                          role="menuitem"
                          className="menu-item menu-item-destructive"
                          disabled={busy}
                          onClick={() => {
                            onRemoveKey(rec);
                            setOpenMenuId(null);
                          }}
                        >
                          <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>{host.i18n.t('settings.action.delete')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Inputs et boutons d'actions généraux */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <input
          ref={fileRef}
          type="file"
          accept=".asc,.key,.pgp"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="composer-btn"
            style={{ flex: 1 }}
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {host.i18n.t('settings.add_private_key')}
          </button>

          <button
            type="button"
            className="composer-btn"
            style={{ flex: 1 }}
            disabled={busy}
            onClick={() => setGen((prev) => ({ ...prev, open: !prev.open }))}
          >
            {host.i18n.t('settings.generate_key')}
          </button>
        </div>

        {/* Formulaire de génération de clés */}
        {gen.open && (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', backgroundColor: 'var(--color-muted, #f8fafc)' }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {host.i18n.t('settings.create_key_pair')}
            </div>
            
            <input
              type="text"
              placeholder={host.i18n.t('settings.full_name')}
              required
              value={gen.name}
              onChange={(e) => setGen({ ...gen, name: e.target.value })}
              style={{ height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background, #ffffff)', outline: 'none' }}
            />
            
            <input
              type="email"
              placeholder={host.i18n.t('settings.email')}
              required
              value={gen.email}
              onChange={(e) => setGen({ ...gen, email: e.target.value })}
              style={{ height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background, #ffffff)', outline: 'none' }}
            />
            
            <input
              type="password"
              placeholder={host.i18n.t('settings.passphrase')}
              required
              value={gen.pass}
              onChange={(e) => setGen({ ...gen, pass: e.target.value })}
              style={{ height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background, #ffffff)', outline: 'none' }}
            />
            
            <button
              type="button"
              className="composer-btn"
              disabled={busy || !gen.email || !gen.pass}
              onClick={onGenerateKey}
            >
              {host.i18n.t('settings.generate_revocation')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}