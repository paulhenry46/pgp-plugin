import { unlockPrivateKey } from "../pgp/import.ts";
import { broadcastUnlockKey } from "../pgp/session-broadcast.ts";
import { getDefaultKeyRecord } from "../storage.ts";
import host from '@plugin-host';

export async function askForDefaultKeyPass(): Promise<void> {
  const defaultKey = await getDefaultKeyRecord();

  if (defaultKey) {
    const result = await host.ui.prompt({
      title: host.i18n.t('prompt.unlock_default_key.title'),
      message: host.i18n.t('prompt.unlock_default_key.message'),
      fields: [{ 
        name: 'passphrase', 
        label: host.i18n.t('prompt.unlock_default_key.passphrase_label'), 
        type: 'password', 
        required: true 
      }]
    });
    if (!result || !result.passphrase) {
      return; 
    }

    const unlockPassphrase = result.passphrase;

    try {
      const { unlockedPrivateKey, signingKey, decryptionKey, aesKey } = await unlockPrivateKey(defaultKey, unlockPassphrase);     
      
      broadcastUnlockKey({ 
        id: defaultKey.id, 
        unlockedPrivateKey, 
        signingKey, 
        decryptionKey,
        aesKey: aesKey,
      });
      host.ui.rerenderFetchedEmails();
    } catch (error) {
      throw new Error('Failed to unlock the default key: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}