// used to verify all keys are unlocked before attempting to send. 
// Indeed, if user can't unlock a key for whatever reason, if the check is in onComposeSend hook,
// we won't be able to send email, and email will be lost.

import { unlockPrivateKey } from "../pgp/import.ts";
import { broadcastUnlockKey } from "../pgp/session-broadcast.ts";
import { getDefaultPublicKeyForEncryption, getKeyRecord } from "../storage.ts";
import { emailsOf, unlockedDecryptMaps } from "../util.ts";
import { recipientKeysFor } from "../pgp/key-utils.ts";
import { resolveIntent, signingKeyRecordForEmail } from "./onComposeSend.ts";
import { config } from "../shared.ts";
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
  // Plain mail must not require a PGP key or passphrase unless admin policy
  // explicitly requires keys. onComposeSend will then use the ordinary path.
  const { sign, encrypt } = await resolveIntent(req);
  if (!sign && !encrypt &&
      (await config('forceEncryption')) !== true &&
      (await config('blockUntilDefaultKeyIsAvailable')) !== true) {
    return true;
  }

  const fromEmail = req.fromEmail;

  const signingKeyRecord = await signingKeyRecordForEmail(fromEmail);
  const draftEncryptionKeyId = await getDefaultPublicKeyForEncryption(true);

  if (!signingKeyRecord || !draftEncryptionKeyId) {
    throw new Error('Failed to get required keys for email sending.');
  }

  if (encrypt) {
    const recipients = [...new Set([...emailsOf(req.to), ...emailsOf(req.cc), ...emailsOf(req.bcc)])];
    if (recipients.length > 0) {
      let found: Record<string, string> | null = null;
      try {
        found = (await recipientKeysFor(recipients)).found;
      } catch (err) {
        host.log.warn('recipient key lookup failed', err);
      }

      if (!found || Object.keys(found).length === 0) {
        const continueSending = await host.ui.confirm({
          title: host.i18n.t('confirm.no_recipient_keys_title'),
          message: host.i18n.t(found ? 'confirm.no_recipient_keys_message' : 'confirm.recipient_keys_unknown_message'),
          danger: true,
          confirmLabel: host.i18n.t('confirm.no_recipient_keys_confirm'),
        });

        if (!continueSending) {
          return false;
        }
      }
    }
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