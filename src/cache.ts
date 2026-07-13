import { DecryptedCachePayload, getAllMessageCache, KeyRecord } from "./storage.ts";
import { broadcastInitializeRamIndex } from "./pgp/session-broadcast.ts";
import { AES_KEY_LENGTH } from "./shared.ts";
import { 
  saveMessageCache, 
  listKeyRecords, 
  EncryptedMessageCache,  
} from './storage.ts';
import { 
  fetchKeyFromBackground, 
  broadcastUpdateRamIndexEntry 
} from './pgp/session-broadcast.ts';

export async function deriveAesKeyFromPgpParams(passphrase: string, salt: ArrayBuffer, iterations: number): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false, // not extractable
    ['encrypt', 'decrypt'],
  );
}

export async function getIndex(aesKey: CryptoKey, passphrase: string, record: KeyRecord): Promise<void> {
      try {
        const allEncryptedCache = await getAllMessageCache();
        const decryptedIndexMemory: Record<string, DecryptedCachePayload> = {};
        await Promise.all(
          allEncryptedCache.map(async (item) => {
            try {
                const cleanIv = Uint8Array.from(item.iv);
                const cleanPayload = Uint8Array.from(item.encryptedPayload);
              const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: cleanIv },
                aesKey,
                cleanPayload
              );
              const jsonString = new TextDecoder().decode(decryptedBuffer);
              decryptedIndexMemory[item.id] = JSON.parse(jsonString) as DecryptedCachePayload;
            } catch (e) {
              throw new Error(`Failed to decrypt cache for email ID ${item.id}: ${e instanceof Error ? e.message : String(e)}`);
            }
          })
        );
        broadcastInitializeRamIndex(decryptedIndexMemory);
    
      } catch (dbErr) {
        throw new Error('Failed to load or decrypt the message cache: ' + (dbErr instanceof Error ? dbErr.message : String(dbErr)));
      }

      return 

}


function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ")   // Enlève la ponctuation
    .split(/\s+/)
    .filter((word, index, self) => word.length > 2 && self.indexOf(word) === index);
}

export async function indexAndPersistDecryptedMail(
  mailId: string, 
  clearText: string
): Promise<void> {
  try {
    const allKeys = await listKeyRecords();
    const defaultKey = allKeys.find((k) => k.default === true);

    if (!defaultKey) {
      return;
    }
    const sessionData = await fetchKeyFromBackground(defaultKey.id);
    
    if (!sessionData || !sessionData.aesKey) {
      return; 
    }
    
    const aesKey = sessionData.aesKey;
    const preview = clearText.substring(0, 150).replace(/\s+/g, ' ').trim() + (clearText.length > 150 ? '...' : '');
    const tokens = tokenizeText(clearText);

    const decryptedPayload: DecryptedCachePayload = { preview, tokens };

    const textBytes = new TextEncoder().encode(JSON.stringify(decryptedPayload));
    const iv = crypto.getRandomValues(new Uint8Array(12)); // IV unique par mail

    const encryptedPayload = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      textBytes
    );

    const encryptedRecord: EncryptedMessageCache = {
      id: mailId,
      encryptedPayload: new Uint8Array(encryptedPayload),
      iv: iv
    };

    await saveMessageCache(encryptedRecord);

    broadcastUpdateRamIndexEntry(mailId, decryptedPayload);

  } catch (error) {
    throw error;
  }
}

export function search(query: string, index: Record<string, DecryptedCachePayload>): string[] {
    const cleanedQuery = query.toLowerCase().trim(); //normalize the query for case-insensitive search
        const matchingIds: string[] = [];

        if (cleanedQuery) {
          for (const [id, data] of Object.entries(index)) {
            const matches = data.tokens.some(token => token.includes(cleanedQuery));
            if (matches) {
              matchingIds.push(id);
            }
          }
        }
        return matchingIds;
}

export function getPreview(emailIds: string[], index: Record<string, DecryptedCachePayload>): Record<string, string> {

    const previewsResult: Record<string, string> = {};
        for (const id of emailIds) {
          if (index[id]) {
            previewsResult[id] = index[id].preview;
          }
        }
        return previewsResult;
}