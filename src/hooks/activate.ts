import { unlockPrivateKey } from "../pgp/import.ts";
import { broadcastUnlockKey } from "../pgp/session-broadcast.ts";
import { getDefaultKeyRecord } from "../storage.ts";

export async function askForDefaultKeyPass(api: any): Promise<void> {
  const defaultKey = await getDefaultKeyRecord();

  if (defaultKey) {
    const result = await api.ui.prompt({
      title: api.i18n.t('prompt.unlock_default_key.title'),
      message: api.i18n.t('prompt.unlock_default_key.message'),
      fields: [{ 
        name: 'passphrase', 
        label: api.i18n.t('prompt.unlock_default_key.passphrase_label'), 
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
    } catch (error) {
      throw new Error('Failed to unlock the default key: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}