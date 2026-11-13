import { 
  EncryptedMessageCache, 
  getKeyRecord, 
  saveKeyRecord, 
  saveMessageCache, 
  clearAllMessageCache, 
  getPluginsDataForAccount,
  savePluginData 
} from "../storage.ts";
import { importOpenPgpPrivateKey, unlockPrivateKey } from "./import.ts";
import { broadcastUnlockKey, fetchRamIndexFromBackground } from "./session-broadcast.ts";
import { deriveSecret } from "./key-utils.ts";
import { base64ToBuffer, bufferToBase64 } from "../util.ts";
import * as openpgp from 'openpgp';
import host from '@plugin-host';

export async function changePassword(keyID: string, oldPassphrase: string, newPassphrase: string) {
  const originalRec = await getKeyRecord(keyID);

  if (!originalRec) {
    host.toast.error(host.i18n.t('settings.error.key_not_found'));
    return;
  }

  try {
    const oldUnlocked = await unlockPrivateKey(originalRec, oldPassphrase);
    const { unlockedPrivateKey } = oldUnlocked;
    const parsedKey = await openpgp.readKey({ armoredKey: unlockedPrivateKey });
    const reencryptedPgpKey = await openpgp.encryptKey({
      privateKey: parsedKey as openpgp.PrivateKey,
      passphrase: newPassphrase
    });
    const newArmoredPgpKey = reencryptedPgpKey.armor();
    const { keyRecord: updatedRecord } = await importOpenPgpPrivateKey(
      newArmoredPgpKey, 
      newPassphrase, 
      newPassphrase
    );

    updatedRecord.id = originalRec.id;
    updatedRecord.recoverable = originalRec.recoverable;
    if (originalRec.default) {
      updatedRecord.default = true;
    }

    await saveKeyRecord(updatedRecord);
    const unlockedSession = await unlockPrivateKey(updatedRecord, newPassphrase);
    if (updatedRecord.default && unlockedSession.aesKey) {
      await changePassphraseForCache(unlockedSession.aesKey, updatedRecord.id);
    }
    if (updatedRecord.default && oldUnlocked.hmacKey && unlockedSession.hmacKey) {
      await reencryptPluginDataForAccount(updatedRecord.id, oldUnlocked.hmacKey, unlockedSession.hmacKey);
    }

    broadcastUnlockKey({ 
      id: updatedRecord.id, 
      unlockedPrivateKey: unlockedSession.unlockedPrivateKey, 
      signingKey: unlockedSession.signingKey, 
      decryptionKey: unlockedSession.decryptionKey,
      aesKey: unlockedSession.aesKey,
      hmacKey: unlockedSession.hmacKey
    });

    host.toast.success("Your passphrase has been successfully changed!");

  } catch (err) {
    const error = err as Error;
    host.toast.error(host.i18n.t('settings.error.unlock_failed', { 
      message: error?.message ? error.message : "Invalid current passphrase." 
    }));
  }
}

async function changePassphraseForCache(newAesKey: CryptoKey, keyRecordId: string) {
  const decryptedIndex = await fetchRamIndexFromBackground();

  if (!decryptedIndex || Object.keys(decryptedIndex).length === 0) {
    await clearAllMessageCache();
    return;
  }
  const encryptedCache: EncryptedMessageCache[] = await Promise.all(
    Object.entries(decryptedIndex).map(async ([mailId, decryptedPayload]) => {
      const textBytes = new TextEncoder().encode(JSON.stringify(decryptedPayload));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encryptedPayload = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        newAesKey,
        textBytes
      );

      return {
        id: mailId,
        keyRecordId: keyRecordId,
        encryptedPayload: new Uint8Array(encryptedPayload),
        iv: iv
      };
    })
  );

  await clearAllMessageCache();
  await Promise.all(encryptedCache.map(record => saveMessageCache(record)));
}


async function reencryptPluginDataForAccount(accountId: string, oldHmacKey: CryptoKey, newHmacKey: CryptoKey) {
  try {

    const accountEntries = await getPluginsDataForAccount(accountId)

    for (const entry of accountEntries) {
      if (!entry || !entry.data) continue;
      
      const parts = entry.id ? entry.id.split('___') : [];
      const pluginId = parts[0];
      if (!pluginId) continue;

      try {
        const oldSecret = await deriveSecret(oldHmacKey, pluginId);
        const newSecret = await deriveSecret(newHmacKey, pluginId);

        const oldKek = await importSecretAsKek(oldSecret);
        const newKek = await importSecretAsKek(newSecret);

        const envelope = entry.data;
        const ivBase64 = envelope.iv;
        const ciphertextBase64 = envelope.wrappedKeys || envelope.ciphertext;

        if (!ivBase64 || !ciphertextBase64) {
          continue;
        }
        const cipherBuf = base64ToBuffer(ciphertextBase64);
        if(!cipherBuf){
          continue;
        }

        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: base64ToBuffer(ivBase64) },
          oldKek,
          cipherBuf
        );

        const newIv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: newIv },
          newKek,
          decrypted
        );

        const newEnvelope = {
          iv: bufferToBase64(newIv),
          wrappedKeys: bufferToBase64(encrypted)
        };

        await savePluginData(pluginId, newEnvelope, accountId);
      } catch (pluginErr) {
        console.error(`Failed to re-encrypt plugin data for plugin ${pluginId}:`, pluginErr);
      }
    }
  } catch (err) {
    console.error('Failed to process plugin data re-encryption during password change:', err);
  }
}

async function importSecretAsKek(secret: string): Promise<CryptoKey> {
  const rawKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt', 'encrypt']);
}