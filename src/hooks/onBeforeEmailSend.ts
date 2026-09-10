// used to verify all keys are unlocked before attempting to send. 
// Indeed, if user can't unlock a key for whatever reason, if the check is in onComposeSend hook,
// we won't be able to send email, and email will be lost.

import { unlockPrivateKey } from "../pgp/import.ts";
import { broadcastUnlockKey } from "../pgp/session-broadcast.ts";
import { getDefaultPublicKeyForEncryption, getKeyRecord } from "../storage.ts";
import { unlockedDecryptMaps } from "../util.ts";
import { signingKeyRecordForEmail } from "./onComposeSend.ts";
import host from '@plugin-host';

async function ensureKeyUnlocked(keyId: string, email: string, unlockedKeys: Map<string, any>): Promise<boolean> {
  if (unlockedKeys.has(keyId)) {
    return true;
  }

  while (true) {
    try {
      const result = await host.ui.prompt({
        title: host.i18n.t('prompt.unlock_key.title'),
        message: `${host.i18n.t('prompt.unlock_key.message_prefix')}${email}${host.i18n.t('prompt.unlock_key.message_suffix')}`,
        fields: [{ 
          name: 'passphrase', 
          label: host.i18n.t('prompt.unlock_key.passphrase_label'), 
          type: 'password', 
          required: true 
        }]
      });
      if (!result || !result.passphrase) {
        return false;
      }

      const rec = await getKeyRecord(keyId);
      if (!rec) {
        throw new Error(`Key record not found for ID: ${keyId}`);
      }

      const { unlockedPrivateKey, signingKey, decryptionKey, aesKey, hmacKey } = await unlockPrivateKey(rec, result.passphrase);

      broadcastUnlockKey({ 
        id: rec.id, 
        unlockedPrivateKey, 
        signingKey, 
        decryptionKey,
        aesKey,
        hmacKey
      });

      unlockedKeys.set(keyId, { unlockedPrivateKey, signingKey, decryptionKey, aesKey, hmacKey });
      return true;

    } catch (error) {
      console.error('Error occurred while unlocking key:', error);
    }
  }
}

export async function onBeforeEmailSend(req: any): Promise<boolean> {
  const fromEmail = req.fromEmail;

  const signingKeyRecord = await signingKeyRecordForEmail(fromEmail);
  const draftEncryptionKeyId = await getDefaultPublicKeyForEncryption(true);

  if (!signingKeyRecord || !draftEncryptionKeyId) {
    throw new Error('Failed to get required keys for email sending.');
  }

  const { unlockedKeys } = await unlockedDecryptMaps();

  const signingUnlocked = await ensureKeyUnlocked(signingKeyRecord.id, fromEmail, unlockedKeys);
  if (!signingUnlocked) {
    return false;
  }

  const encryptionUnlocked = await ensureKeyUnlocked(draftEncryptionKeyId, fromEmail, unlockedKeys);
  if (!encryptionUnlocked) {
    return false;
  }

  return true;
}