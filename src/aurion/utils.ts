import { AurionAPI } from './api.ts';
import { readSecret, getToken, setToken, removeSecret, clearDangerousStorage, loadDangerousPassphrases, getKeyRecord, persistPassphraseToDangerousStorage, readTempToken, deleteAllKeyRecords } from '../storage.ts';
import  host  from '@plugin-host';
import { 
  listKeyRecords, 
  saveKeyRecord, 
  deleteKeyRecord, 
  clearAllMessageCache, 
  saveMessageCache, 
} from '../storage.ts';
import { generateUUID } from '../util.ts';
import { consumeSecret } from './secrets/client.ts';
import { config, settings } from '../shared.ts';
import { argon2id } from 'hash-wasm';
import { broadcastUnlockKey } from '../pgp/session-broadcast.ts';
import { unlockPrivateKey } from '../pgp/import.ts';
import {CHANNEL_NAME} from '../pgp/session-broadcast.ts';
import { broadcastInitializeMasterPass, initAurionBackgroundSessionListener } from './session-broadcast.ts';
import { sendToBridgeIframe } from './secrets/sender.ts';

export async function initAurionAPI(): Promise<AurionAPI> {
  const baseUrl: string =  await config('AurionURL');
  host.log.info(`Initializing AurionAPI with base URL: ${baseUrl}`);
  const api = new AurionAPI(baseUrl);

        const token = await getToken();
        if(token){
            api.setToken(token);
        }else{
            console.log("No token found for Aurion API. Did you run activateAurionAPI() first?");
        }
    
    return api;
}

export async function activateAurionAPI(): Promise<boolean> {
  initAurionBackgroundSessionListener();
  const baseUrl: string =  await config('AurionURL');
  host.log.info(`Initializing AurionAPI with base URL: ${baseUrl}`);
  const api = new AurionAPI(baseUrl);
  let locked = true;
  
    const secret = await readSecret();
    const tempToken = await readTempToken();
    let masterPass: string | undefined = undefined;
    if (secret && tempToken) {
      if(await config('ExternalSSO') !== true){// in case of external sso, we don't have password from auth step, user need to put its aurion password.
        masterPass = await consumeSecret(secret.id);
      }
        host.log.info(`Using secret: ${masterPass} to authenticate with AurionAPI.`);
        
        const data = await api.login(tempToken);
        await setToken(data.token);
        await removeSecret();
        
    }else{
        // if no secret look for jwt token
        const token = await getToken();
        if(token){
            api.setToken(token);
        }else{
            console.log("No token found for Aurion API. State", secret, tempToken);
        }
    }

      await syncfromAurion(api);
      await GiveSSOTokenToSSO(api);
      if(masterPass){
        await restoreKeys(masterPass);
        locked = false;
      }
    return locked;
}

async function restoreKeys(masterPass: string): Promise<void> {

  try {
    console.log("Restoring keys from dangerous storage with masterPass:", masterPass);
    broadcastInitializeMasterPass(masterPass);
    console.log("Broadcasted masterPass to background session listener.");
    const keys = await listKeyRecords()
    // we assume all keys have the same master password, so we use the provided masterPass to unlock them. 
    // Indeed, in Aurion context, the master password is used to generate keys.
    
    if (keys.length > 0) {
      for (const rec of keys) {
        if(rec.recovery === true) continue; // Skip recovery keys
          // This naturally calls `getIndex` inside unlockPrivateKey and loads RAM
          const { unlockedPrivateKey, signingKey, decryptionKey, aesKey, hmacKey } = await unlockPrivateKey(rec, masterPass, true);

          broadcastUnlockKey({ 
        id: rec.id, 
        unlockedPrivateKey, 
        signingKey, 
        decryptionKey ,
        aesKey: aesKey,
        hmacKey: hmacKey
      });

      if (settings().StoreDangerous && await config('allowPersistentKeys') === true) {
        await persistPassphraseToDangerousStorage(rec.id, masterPass).catch(console.error);
      }
      
      }
      // Broadcast unlock status to other listeners
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'KEY_UPDATED', isUnlocked: true });
      channel.close();
    }
  } catch (err) {
    host.log.error('Failed to auto-unlock keys from dangerous storage:', err);
  }
}


export async function syncfromAurion(api: AurionAPI): Promise<void> {
  // 1. Récupération des données du coffre-fort distant
  const vaultData = await api.getVault();
  console.log("Données du coffre-fort récupérées depuis Aurion:", vaultData);

  const remoteKeys = vaultData.keys || [];
  const remoteMessageCache = vaultData.messageCache || [];

  // ==========================================
  // 2. SYNCHRONISATION DU CACHE (Écrasement complet)
  // ==========================================
  await clearAllMessageCache();
  for (const item of remoteMessageCache) {
    await saveMessageCache(item);
  }

  // ==========================================
  // 3. SYNCHRONISATION DES CLÉS PRIVÉES
  // ==========================================

  await deleteAllKeyRecords();
  for (const remoteKey of remoteKeys) {
    await saveKeyRecord(remoteKey, false);
  }
}

export async function syncKeysToAurion(api: AurionAPI): Promise<{status: string;}> {
  return await api.updateKeys(await listKeyRecords());
}

async function GiveSSOTokenToSSO(api: AurionAPI): Promise<boolean> {
  try {
    const token = api.getToken();

    if (!token) {
      host.toast.error("Unable to retrieve token. Please ensure your default key is unlocked and try again.");
      return false;
    }

    const ssoDomain = await config('SSOURL');

    await sendToBridgeIframe(
      `${ssoDomain}/sso_bridge.html`,
      ssoDomain,
      { type: 'WRITE_SSO_TOKEN', token }
    );

    return true;
  } catch (error) {
    host.toast.error(`An error occurred while transfering the SSO TOKEN: ${error}`);
    return false;
  }
}