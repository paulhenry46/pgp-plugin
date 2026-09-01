import host from '@plugin-host';
import * as openpgp from 'openpgp';
import React from 'react'
const { useState, useEffect, useCallback, useRef } = React;
import {
  saveKeyRecord, listKeyRecords, deleteKeyRecord,
  KeyRecord, PublicCert, exportPluginData, importPluginData,
  getKeyRecord,
  loadDangerousPassphrases,
  clearAllMessageCache,
  persistPassphraseToDangerousStorage
} from '../../../storage.ts';

import { importOpenPgpPrivateKey, importOpenPgpPublicKey, unlockPrivateKey } from '../../../pgp/import.ts';
import { encryptPassphraseWithWebAuthn, decryptPassphraseWithWebAuthn, unlockWithWebAuthnRegisteredKeys } from '../../../webauthn/settings.ts';

import { 
  fetchKeyFromBackground, 
  broadcastUnlockKey, 
  broadcastLockKey,
  subscribeToKeyUpdates
} from '../../../pgp/session-broadcast.ts';
import { uploadKey, requestVerify, lookup } from '../../../pgp/server.ts';
import { AccountEntry, bufferToBytes, bytesToBuffer, EncryptionAtRestConfig, generateNumericRecoveryCode, generateSalt, PublicKeyInput } from '../../../util.ts';
import { changePassword } from '../../../pgp/change-passphrase.ts';
import { settings } from '../../../shared.ts';

export function useSettingsLogic() {
  const [accounts, setAccounts] = useState<AccountEntry[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [persisted, setPersisted] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<boolean>(false);
  
  const fileRef = useRef<HTMLInputElement | null>(null);
  const certFileRef = useRef<HTMLInputElement | null>(null);
  const jsonFileRef = useRef<HTMLInputElement | null>(null);
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [gen, setGen] = useState({ open: false, name: '', email: '', pass: '' });

  useEffect(() => {
    let isMounted = true;

    async function loadAccounts() {
      setBusy(true);
      try {
        const fetchedAccounts: AccountEntry[] = await host.user.getAccounts(); 
        console.warn(fetchedAccounts);
        
        if (isMounted) {
          setAccounts(fetchedAccounts);

          const connectedAccount = fetchedAccounts.find((acc) => acc.isActive);
          if (connectedAccount) {
            setSelectedAccountId(connectedAccount.id);
          } else {
            setSelectedAccountId(undefined);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des comptes:", error);
      } finally {
        if (isMounted) setBusy(false);
      }
    }

    void loadAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectAccount = useCallback((accountId: string | undefined) => {
    setSelectedAccountId(accountId);
  }, []);
  
  const refresh = useCallback(async () => {
    console.log("Refreshing keys and certs for account:", selectedAccountId);
    const [k] = await Promise.all([listKeyRecords(selectedAccountId)]);
    setKeys(k);
    
    const u: Record<string, boolean> = {};
    const p: Record<string, boolean> = {};
    const dict = await loadDangerousPassphrases();
    for (const rec of k) {
      u[rec.id] = !!(await fetchKeyFromBackground(rec.id));
      p[rec.id] = !!dict[rec.id];
    }
    setUnlocked(u);
    setPersisted(p);
  }, [selectedAccountId]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const unsubscribe = subscribeToKeyUpdates(() => {
      void refresh();
    });
    return unsubscribe;
  }, [refresh]);

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
      
      const hasDefaultKey = keys.some(k => k.default);
      await saveKeyRecord({ ...keyRecord, default: !hasDefaultKey });
      // we autimatically set the imported key as the main key for the mail. User can change the main key later.
      await handleSetMainPrivateKey(keyRecord, true);
      const unlockedSession = await unlockPrivateKey(keyRecord, storagePass);

       broadcastUnlockKey({ 
      id: keyRecord.id, 
      unlockedPrivateKey: unlockedSession.unlockedPrivateKey, 
      signingKey: unlockedSession.signingKey, 
      decryptionKey: unlockedSession.decryptionKey,
      aesKey: unlockedSession.aesKey,
      hmacKey: unlockedSession.hmacKey
    });

      host.toast.success(host.i18n.t('settings.success.private_key_imported', { identity: keyRecord.email || host.i18n.t('settings.label.generic_identity') }));
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(host.i18n.t('settings.error.import_failed', { message: error?.message ? error.message : String(err) }));
    } finally {
      if (fileRef.current) fileRef.current.value = '';
      setBusy(false);
    }
  }

  async function handleLinkWebAuthn(rec: KeyRecord) {
    let passphrase = "";

    const result = await host.ui.prompt({
      title: host.i18n.t('prompt.link_webauthn.title'),
      message: host.i18n.t('prompt.link_webauthn.message'),
      fields: [{ 
        name: 'passphrase', 
        label: host.i18n.t('prompt.link_webauthn.passphrase_label'), 
        type: 'password', 
        required: true 
      }]
    });
    
    if (!result || !result.passphrase) return;
    passphrase = result.passphrase;
    try {
      await unlockPrivateKey(rec, passphrase);
    } catch {
      host.toast.error(host.i18n.t('settings.error.incorrect_passphrase'));
      return;
    }

    setBusy(true);
    try {

      const existingKeyWithWebAuthn = keys.find(k => k.webauthn?.credentialId);
      const masterCredIdBytes = existingKeyWithWebAuthn?.webauthn
        ? bufferToBytes(existingKeyWithWebAuthn.webauthn.credentialId)
        : undefined;

      let credentialId: number[] = [];
      let prfSecret: number[] = []; 

      if(!masterCredIdBytes) {
      // 1. Initiate passkey creation
      let response = await host.crypto.createWebAuthn(
        'bulwark-webmail-pgp-true-e2e', 
        'Master Key for Bulwark PGP Plugin'
      );

      // 2. Handle iOS/Safari fallback requiring a fresh user gesture
      if (response.success === false && response.reason === 'NEEDS_USER_ACTION') {
        const userConfirmed = await host.ui.confirm({
          title: 'Passkey Created',
          message: 'Your key was saved. Click OK to unlock and complete setup.'
        });

        if (userConfirmed && response.credentialId) {
          // Pass the credentialId obtained during creation to retrieve the PRF secret
          const newResponse = await host.crypto.getWebAuthn(response.credentialId);
          credentialId = newResponse.credentialId;
          prfSecret = newResponse.prfSecret;
        } else {
          // User cancelled the confirmation modal
          return { success: false, reason: 'User cancelled secondary verification.' };
        }
      }else if(response.credentialId && response.prfSecret){
          credentialId = response.credentialId;
          prfSecret = response.prfSecret;
      }

      // 3. Handle failure or process success
      if (!response || ('success' in response && response.success === false)) {
        console.error('Failed to setup WebAuthn key:', response.reason);
        return;
      }

      } else {
        // If we have an existing master credential, use it to get the PRF secret
        credentialId = masterCredIdBytes;
        const response = await host.crypto.getWebAuthn(masterCredIdBytes);
        prfSecret = response.prfSecret;
      }
      
      const { ciphertext, iv } = await encryptPassphraseWithWebAuthn(passphrase, bytesToBuffer(prfSecret));

      await saveKeyRecord({
        ...rec,
        webauthn: {
          credentialId : bytesToBuffer(credentialId),
          encryptedPassphrase: ciphertext,
          iv: iv.buffer.slice(0) as ArrayBuffer
        }
      });

      host.toast.success(
        masterCredIdBytes 
          ? host.i18n.t('settings.success.webauthn_linked_existing') 
          : host.i18n.t('settings.success.webauthn_linked_new')
      );
      await refresh();
    } catch (err: any) {
      host.toast.error(host.i18n.t('settings.error.generic_failure', { message: err.message }));
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlockAllWithWebAuthn() {
    await unlockWithWebAuthnRegisteredKeys(keys, unlocked, setBusy, refresh);
  }

  async function removeWebAuthnLink(rec: KeyRecord) {
    const ok = await host.ui.confirm({
      title: host.i18n.t('settings.confirm.remove_webauthn_title'),
      message: host.i18n.t('settings.confirm.remove_webauthn_msg', { identity: rec.email || host.i18n.t('settings.label.generic_identity') }),
      danger: true,
      confirmLabel: host.i18n.t('settings.action.remove'),
    });
    if (!ok) return;

    setBusy(true);
    try {
      await saveKeyRecord({
        ...rec,
        webauthn: undefined
      });
      host.toast.success(host.i18n.t('settings.success.webauthn_removed'));
      await refresh();
    } catch (err: any) {
      host.toast.error(host.i18n.t('settings.error.generic_failure', { message: err.message }));
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
      const { unlockedPrivateKey, signingKey, decryptionKey, aesKey, hmacKey } = await unlockPrivateKey(rec, result.passphrase);
      
      broadcastUnlockKey({ 
        id: rec.id, 
        unlockedPrivateKey, 
        signingKey, 
        decryptionKey ,
        aesKey: aesKey,
        hmacKey: hmacKey
      });
      
      host.toast.success(host.i18n.t('settings.success.key_unlocked', { identity: rec.email || host.i18n.t('settings.label.generic_key') }));
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(host.i18n.t('settings.error.unlock_failed', { message: error?.message ? error.message : host.i18n.t('settings.error.fallback_unlock_failed') }));
    } finally {
      setBusy(false);
    }
  }

  async function initiateRecoveryUnlock(recID: string) {
    const recoveryRec = await getKeyRecord(recID + '_recovery');
    const originalRec = await getKeyRecord(recID);

    if (!recoveryRec || !originalRec) {
      host.toast.error(host.i18n.t('settings.error.key_not_found'));
      return;
    }

    const identity = originalRec.email || host.i18n.t('prompt.unlock_key.fallback_identity');

    // 2. Prompt for recovery code
    const recoveryResult = await host.ui.prompt({
      title: 'Emergency Recovery Unlock',
      message: `Enter your numeric recovery code for ${identity}:`,
      fields: [{ 
        name: 'recoveryCode', 
        label: 'Recovery Code (e.g., 4829-1038-...)', 
        type: 'text', 
        required: true 
      }]
    });

    if (!recoveryResult || !recoveryResult.recoveryCode) return;

    const cleanCode = recoveryResult.recoveryCode.replace(/[\s-]/g, '');

    setBusy(true);
    try {
      // 3. Unlock using the recovery record and clean code
      const { unlockedPrivateKey } = await unlockPrivateKey(recoveryRec, cleanCode);

      // 4. Prompt for new passphrase
      const newPassResult = await host.ui.prompt({
        title: 'Set New Passphrase',
        message: 'Recovery successful! Please set a new passphrase for your key:',
        fields: [
          { 
            name: 'newPassphrase', 
            label: 'New Passphrase', 
            type: 'password', 
            required: true 
          },
          { 
            name: 'confirmPassphrase', 
            label: 'Confirm Passphrase', 
            type: 'password', 
            required: true 
          }
        ]
      });

      if (!newPassResult || !newPassResult.newPassphrase) {
        host.toast.error("Passphrase reset canceled.");
        return;
      }

      if (newPassResult.newPassphrase !== newPassResult.confirmPassphrase) {
        host.toast.error("Passphrases do not match.");
        return;
      }

      const newPass = newPassResult.newPassphrase;

      // 5. Re-encrypt internal PGP key packets with the NEW passphrase
      const parsedKey = await openpgp.readKey({ armoredKey: unlockedPrivateKey });
      // unlockedPrivateKey is already decrypted at the PGP level, so we can re-encrypt it with the new passphrase
      const reencryptedPgpKey = await openpgp.encryptKey({
        privateKey: parsedKey as openpgp.PrivateKey,
        passphrase: newPass
      });
      const newArmoredPgpKey = reencryptedPgpKey.armor();

      // 6. Import and update the ORIGINAL key record
      const { keyRecord: updatedRecord } = await importOpenPgpPrivateKey(newArmoredPgpKey, newPass, newPass);

      // On restaure l'ID original exact et les flags/propriétés de la clé d'origine
      updatedRecord.id = originalRec.id;
      updatedRecord.recoverable = true;
      if (originalRec.default) {
        updatedRecord.default = true;
      }
      if(originalRec.main) {
        updatedRecord.main = true;
      }

      await saveKeyRecord(updatedRecord);
      // we can't unlock the message cache because it was encrypto with a derived key from the master key, which is lost. 
      // So, we need to remove to avoid decryption errors
      clearAllMessageCache();
      // 7. Re-unlock for active session using updated record & new pass
      const unlockedSession = await unlockPrivateKey(updatedRecord, newPass);

      broadcastUnlockKey({ 
        id: updatedRecord.id, 
        unlockedPrivateKey: unlockedSession.unlockedPrivateKey, 
        signingKey: unlockedSession.signingKey, 
        decryptionKey: unlockedSession.decryptionKey,
        aesKey: unlockedSession.aesKey,
        hmacKey: unlockedSession.hmacKey
      });

      host.toast.success("Your passphrase has been successfully reset!");
      await refresh();

    } catch (err) {
      const error = err as Error;
      host.toast.error(host.i18n.t('settings.error.unlock_failed', { 
        message: error?.message ? error.message : "Invalid recovery code." 
      }));
    } finally {
      setBusy(false);
    }
  }
  async function handleUploadKey(c: PublicCert | KeyRecord) {
    setBusy(true);
    try {
      const armored = c.publicKey; 
      if (!armored) throw new Error(host.i18n.t('settings.error.no_armored_key'));

      const res = await uploadKey(armored);
      host.toast.success(host.i18n.t('settings.success.key_uploaded'));
      
      if (c.email) {
        await requestVerify(res.token, [c.email]);
        host.toast.info(host.i18n.t('settings.info.verification_email_sent', { email: c.email }));
      }
    } catch (err) {
      const error = err as Error;
      host.toast.error(host.i18n.t('settings.error.upload_failed', { message: error?.message ? error.message : String(err) }));
    } finally {
      setBusy(false);
    }
  }

  async function handleSearchAndImportKey(e?: React.FormEvent) {
    console.log("handleSearchAndImportKey called");
    if (e) e.preventDefault();
    if (!searchEmail || !searchEmail.includes('@')) return;
    setBusy(true);
    try {
      const { armored, email } = await lookup(searchEmail);
      if (!armored) {
        host.toast.error(host.i18n.t('settings.error.no_key_found_directory', { email }));
        return;
      }
      await importOpenPgpPublicKey(armored);
      host.toast.success(host.i18n.t('settings.success.key_imported', { email }));
      setSearchEmail('');
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(host.i18n.t('settings.error.search_failed', { message: error?.message ? error.message : String(err) }));
    } finally {
      setBusy(false);
    }
  }

  async function lock(rec: KeyRecord) {
    broadcastLockKey(rec.id);
    host.toast.info(host.i18n.t('settings.info.key_locked', { identity: rec.email || host.i18n.t('settings.label.generic_key') }));
    await refresh();
  }

  async function removeKey(rec: KeyRecord) {
    const ok = await host.ui.confirm({
      title: host.i18n.t('settings.confirm.delete_private_title'),
      message: host.i18n.t('settings.confirm.delete_private_msg', { identity: rec.email || host.i18n.t('settings.label.generic_identity') }),
      danger: true,
      confirmLabel: host.i18n.t('settings.action.delete'),
    });
    if (!ok) return;

    const reallyOk = await host.ui.prompt({
      title: host.i18n.t('settings.confirm.delete_private_title'),
      message: host.i18n.t('settings.confirm.delete_private_msg', { identity: rec.email || host.i18n.t('settings.label.generic_identity') }),
      confirmLabel: host.i18n.t('settings.action.delete'),
      fields: [{
        name: 'confirmText',
        label: host.i18n.t('settings.confirm.delete_private_confirm_label') + rec.email,
        type: 'text',
        required: true,
      }]
    });

      if (reallyOk && reallyOk.confirmText === rec.email) {
        broadcastLockKey(rec.id);
        await deleteKeyRecord(rec.id);
        if (rec.recoverable) await deleteKeyRecord(rec.id + '_recovery');
        //delete public jey associated by serahcing by email
      host.toast.success(host.i18n.t('settings.success.key_deleted'));
      await refresh();
    }
  }

  async function importCertFile() {
    const file = certFileRef.current && certFileRef.current.files && certFileRef.current.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = new TextDecoder().decode(await file.arrayBuffer());
      const email = await importOpenPgpPublicKey(text);
      host.toast.success(host.i18n.t('settings.success.file_imported', { email }));
      if (certFileRef.current) certFileRef.current.value = '';
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(host.i18n.t('settings.error.file_import_failed', { message: error?.message ? error.message : String(err) }));
    } finally {
      setBusy(false);
    }
  }


  async function handleSetDefaultPrivateKey(targetKey: KeyRecord) {
  setBusy(true);
  try {
    await Promise.all(
      keys.filter(k => k.accountId === targetKey.accountId)
      .map(async (k) => {
        const isCurrent = k.id === targetKey.id;
        
        const updatedKey = {
          ...k,
          default: isCurrent
        };

        if (isCurrent && !k.aesSalt && !k.argon2Params ) {
          updatedKey.aesSalt = generateSalt();
        }

        return saveKeyRecord(updatedKey);
      })
    );
    
    host.toast.success( host.i18n.t('settings.success.default_key_set', { email: targetKey.email }));
    await refresh();
  } catch (err) {
    const error = err as Error;
    host.toast.error(host.i18n.t('settings.error.generic', { message: error?.message ? error.message : String(err) }));
  } finally {
    setBusy(false);
  }
}

  async function handleSetMainPrivateKey(targetKey: KeyRecord, silent: boolean = false) {
  setBusy(true);
  try {
    const email = targetKey.email;
    await Promise.all(
      keys.filter(k => k.email === email)
      .map(async (k) => {
        const isCurrent = k.id === targetKey.id;
        
        const updatedKey = {
          ...k,
          main: isCurrent
        };
        return saveKeyRecord(updatedKey);
      })
    );
    if(!silent){
      host.toast.success( host.i18n.t('settings.success.main_key_set', { email: targetKey.email }));
      await refresh();
    }
  } catch (err) {
    const error = err as Error;
    host.toast.error(host.i18n.t('settings.error.generic', { message: error?.message ? error.message : String(err) }));
  } finally {
    setBusy(false);
  }
}

  async function handleSetServerSideEncryption(k: KeyRecord, embeded: boolean = false) {
  setBusy(true);
  try {
      const pkey = k.publicKey;
      const inputPayload: PublicKeyInput ={
        description: "Key imported by PGP True E2E Bulwark Plugin",
        key: pkey,
      }
      const pkeyId = await host.crypto.createPublicKey(inputPayload);
      const configInput: EncryptionAtRestConfig = {  
        type: "Aes256",
        publicKeyId: pkeyId,
      }
      await host.crypto.setEncryptionAtRest(configInput);
      
      await Promise.all(
      keys.map(async (kcurrent) => {
        const isCurrent = kcurrent.id === k.id;
        
        const updatedKey = {
          ...kcurrent,
          serverSide: isCurrent
        };

        return saveKeyRecord(updatedKey);
      })
    );
    if(!embeded){
      await refresh();
    }
  } catch (err) {
    const error = err as Error;
    host.toast.error(host.i18n.t('settings.error.generic', { message: error?.message ? error.message : String(err) }));
  } finally {
    setBusy(false);
  }
}

  async function handleExportJSON() {
    const accountId = selectedAccountId;
    setBusy(true);
    try {
      await exportPluginData(accountId);
      host.toast.success(host.i18n.t('settings.success.json_exported'));
    } catch (err: any) {
      host.toast.error(host.i18n.t('settings.error.json_export_failed', { message: err.message }));
    } finally {
      setBusy(false);
    }
  }

  async function handleImportJSON() {
    const accountId = selectedAccountId;
    const file = jsonFileRef.current && jsonFileRef.current.files && jsonFileRef.current.files[0];
    if (!file) return;

    const ok = await host.ui.confirm({
      title: host.i18n.t('settings.import_json'),
      message: host.i18n.t('settings.confirm.import_json'),
      danger: true,
      confirmLabel: host.i18n.t('settings.action.import'),
    });
    if (!ok) {
      if (jsonFileRef.current) jsonFileRef.current.value = '';
      return;
    }

    setBusy(true);
    try {
      const text = new TextDecoder().decode(await file.arrayBuffer());
      await importPluginData(text, accountId);
      host.toast.success(host.i18n.t('settings.success.json_imported'));
      await refresh();
    } catch (err: any) {
      host.toast.error(host.i18n.t('settings.error.json_import_failed', { message: err.message }));
    } finally {
      if (jsonFileRef.current) jsonFileRef.current.value = '';
      setBusy(false);
    }
  }
  async function handleGenerateKey(overrideGen?: { name: string, email: string, pass: string }, withRecovery: boolean = true, autoAddToServerSideEncryption: boolean = false) {

    let data = gen as {name: string, email: string, pass: string}
    if(overrideGen?.email){
      data = overrideGen
    }
    if (!data.email || !data.pass) {
      host.toast.error(host.i18n.t('settings.error.missing_fields'));
      return;
    }
    
    setBusy(true);
    try {
      const { codeFormatted, codeRaw } = generateNumericRecoveryCode();
      let privateKey: string;
      let revocationCertificate: string;

      if (settings().generateKey == 'ed25519Legacy') {
        ({ privateKey, revocationCertificate } = await openpgp.generateKey({
          type: 'ecc',
          curve: 'ed25519Legacy',
          userIDs: [{ name: data.name, email: data.email }],
          passphrase: data.pass,
          subkeys: [
            {
              type: 'ecc',
              curve: 'curve25519Legacy',
              sign: false
            }
          ],
          format: 'armored'
        }));
      } else if (settings().generateKey == 'curve25519') {
        ({ privateKey, revocationCertificate } = await openpgp.generateKey({
          type: 'curve25519',
          userIDs: [{ name: data.name, email: data.email }],
          passphrase: data.pass,
          subkeys: [{ type: 'curve25519', sign: false }],
          format: 'armored'
        }));
      } else {
        ({ privateKey, revocationCertificate } = await openpgp.generateKey({
          type: 'rsa',
          rsaBits: 4096,
          userIDs: [{ name: data.name, email: data.email }],
          passphrase: data.pass,
          format: 'armored'
        }));
      }
      //if there is not default key, set this one as default
      // Check for an existing default key
      const hasDefaultKey = keys.some(k => k.default);
      let keyRecord = (await importOpenPgpPrivateKey(String(privateKey), data.pass, data.pass)).keyRecord;

      if(autoAddToServerSideEncryption){
        await handleSetServerSideEncryption(keyRecord);
      }

      // Save the key record with the appropriate flags
      keyRecord = {...keyRecord,
        default: !hasDefaultKey,
        recoverable: withRecovery,
        serverSide: autoAddToServerSideEncryption
      };

      await saveKeyRecord(keyRecord);
      await handleSetMainPrivateKey(keyRecord, true);

    const unlockedSession = await unlockPrivateKey(keyRecord, data.pass);

    broadcastUnlockKey({ 
      id: keyRecord.id, 
      unlockedPrivateKey: unlockedSession.unlockedPrivateKey, 
      signingKey: unlockedSession.signingKey, 
      decryptionKey: unlockedSession.decryptionKey,
      aesKey: unlockedSession.aesKey,
      hmacKey: unlockedSession.hmacKey
    });


    if(withRecovery){
      // 2. Decrypt the generated PGP private key using the provided passphrase
    const parsedKey = await openpgp.readKey({ armoredKey: String(privateKey) });
    if (!parsedKey.isPrivate()) {
      throw new Error('The provided block is a public key, not a private key');
    }

    
    const decryptedPgpKey = await openpgp.decryptKey({
      privateKey: parsedKey,
      passphrase: data.pass
    });

    const unencryptedPgpArmored = decryptedPgpKey.armor(); // Clé PGP 100% en clair
    const { keyRecord: recoveryRecord } = await importOpenPgpPrivateKey(
      unencryptedPgpArmored, 
      codeRaw, // stokage passphrase for recovery is the numeric code
      ''       // no internal passphrase needed for recovery key
    );

    await saveKeyRecord({ 
      ...recoveryRecord, 
      id: `${keyRecord.id}_recovery`, 
      recovery: true, 
      recoverable: false 
    });

      const backupContent = 
` ===================================================================
  PGP RECOVERY & REVOCATION FILE - ${data.email}
  ===================================================================

  [ EMERGENCY NUMERIC RECOVERY CODE ]
  Use these digits if you forget your main passphrase. Keep them secret!

  Code: ${codeFormatted}

  ===================================================================

  [ OPENPGP REVOCATION CERTIFICATE ]
  Use this block to revoke your key if it gets compromised or lost.

  ${revocationCertificate}`;
      host.ui.downloadFile({
        filename: `backup_pgp_${data.email}.txt`, 
        content: backupContent, 
        contentType: 'text/plain'
      });
    }
      
      host.toast.success(host.i18n.t('settings.success.key_generated'));
      setGen({ open: false, name: "", email: "", pass: "" });
      await refresh();
    } catch (err: any) {
      host.toast.error(host.i18n.t('settings.error.generic_failure', { message: err.message }));
    } finally {
      setBusy(false);
    }
  }

  async function changePass(rec: KeyRecord) {
    const identity = rec.email || host.i18n.t('prompt.unlock_key.fallback_identity');

    const result = await host.ui.prompt({
      title: host.i18n.t('prompt.unlock_key.title'),
      message: `${host.i18n.t('prompt.unlock_key.message_prefix')}${identity}${host.i18n.t('prompt.unlock_key.message_suffix')}`,
      fields: [{ 
        name: 'oldPassphrase', 
        label: host.i18n.t('prompt.import_private_key.current_passphrase_label'), 
        type: 'password', 
        required: true 
      },
    { 
        name: 'newPassphrase', 
        label: host.i18n.t('prompt.import_private_key.storage_passphrase_label'), 
        type: 'password', 
        required: true 
      }]
    });

    if (!result || !result.oldPassphrase || !result.newPassphrase) return;

    setBusy(true);
    try {
      await changePassword(rec.id, result.oldPassphrase, result.newPassphrase);

      //check if dangerous storage passphrase is set for this key, if yes, update it with the new one
      const dict = await loadDangerousPassphrases();
      if(dict[rec.id]){
        await persistPassphraseToDangerousStorage(rec.id, result.newPassphrase);
      }
      
      host.toast.success(host.i18n.t('settings.success.key_unlocked', { identity: rec.email || host.i18n.t('settings.label.generic_key') }));
      await refresh();
    } catch (err) {
      const error = err as Error;
      host.toast.error(host.i18n.t('settings.error.unlock_failed', { message: error?.message ? error.message : host.i18n.t('settings.error.fallback_unlock_failed') }));
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadKey(c: PublicCert | KeyRecord) {
    try {
      const armored = c.publicKey; 
      if (!armored) throw new Error(host.i18n.t('settings.error.no_armored_key'));

      host.ui.downloadFile({
        filename: `public_key_${c.email}.asc`, 
        content: armored, 
        contentType: 'application/pgp-keys'
      });
      host.toast.success(host.i18n.t('settings.success.key_downloaded', { email: c.email }));
    } catch (err) {
      const error = err as Error;
      host.toast.error(host.i18n.t('settings.error.download_failed', { message: error?.message ? error.message : String(err) }));
    }
  }

  async function handleExportPrivateKey(rec: KeyRecord) {

    const result = await host.ui.prompt({
      title: host.i18n.t('prompt.export_private_key.title'),
      message: host.i18n.t('prompt.export_private_key.message'),
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
      const passphrase = result.passphrase;
      const { unlockedPrivateKey } = await unlockPrivateKey(rec, passphrase);
      const parsedKey = await openpgp.readKey({ armoredKey: unlockedPrivateKey });
      
      if (!parsedKey.isPrivate()) {
        throw new Error("Not a private key");
      }

      const encryptedPgpKey = await openpgp.encryptKey({
        privateKey: parsedKey as openpgp.PrivateKey,
        passphrase: passphrase
      });

      const armoredExportKey = encryptedPgpKey.armor();

      host.ui.downloadFile({
        filename: `private_key_${rec.email || 'export'}.asc`, 
        content: armoredExportKey, 
        contentType: 'application/pgp-keys'
      });

      host.toast.success(host.i18n.t('settings.success.private_key_exported'));
    } catch (err) {
      const error = err as Error;
      host.toast.error(host.i18n.t('settings.error.export_failed') + error?.message ? error.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return {
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
  };
}