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
    false, // Garder la clé strictement non exportable hors de la RAM
    ['encrypt', 'decrypt'],
  );
}

export async function getIndex(aesKey: CryptoKey, passphrase: string, record: KeyRecord): Promise<void> {

    // 2. Génération de la clé AES en utilisant la même passphrase et le même Salt

    
      // 3. Déchiffrement global de l'index et chargement en RAM
      try {
        const allEncryptedCache = await getAllMessageCache();
        console.log('allEncryptedCache',allEncryptedCache);
        
        const decryptedIndexMemory: Record<string, DecryptedCachePayload> = {};
    
        // Déchiffrement asynchrone parallélisé de tous les blocs de cache
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
              console.error(`Impossible de déchiffrer le cache du message ${item.id}`, e);
            }
          })
        );
        console.log('decryptedIndexMemory', decryptedIndexMemory);
        // Injection immédiate dans la structure RAM globale du plugin
        broadcastInitializeRamIndex(decryptedIndexMemory);
    
      } catch (dbErr) {
        console.error("Erreur lors de la récupération ou du déchiffrement de l'index persistant :", dbErr);
      }

      return 

}

/**
 * Fonction utilitaire de nettoyage de texte pour générer des jetons (Tokens) uniques.
 */
function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ")   // Enlève la ponctuation
    .split(/\s+/)
    .filter((word, index, self) => word.length > 2 && self.indexOf(word) === index);
}

/**
 * Indexation et persistance automatique d'un e-mail déchiffré.
 * Recherche de manière autonome la clé par défaut active pour obtenir la clé AES de session.
 *
 * @param mailId - L'identifiant unique du mail (ex: UID IMAP)
 * @param clearText - Le corps du mail en texte brut (déchiffré)
 */
export async function indexAndPersistDecryptedMail(
  mailId: string, 
  clearText: string
): Promise<void> {
  try {
    // 1. Trouver de manière autonome la clé PGP définie par défaut
    const allKeys = await listKeyRecords();
    const defaultKey = allKeys.find((k) => k.default === true);

    if (!defaultKey) {
      console.warn(`[Plugin] Impossible d'indexer le mail ${mailId} : Aucune clé PGP par défaut n'est configurée.`);
      return;
    }

    // 2. Récupérer la session active (et la clé AES associée) via son ID
    const sessionData = await fetchKeyFromBackground(defaultKey.id);
    
    if (!sessionData || !sessionData.aesKey) {
      console.warn(`[Plugin] Impossible d'indexer le mail ${mailId} : Le plugin est verrouillé (pas de clé AES active).`);
      return; 
    }
    
    const aesKey = sessionData.aesKey;

    // 3. Génération de la Preview et des Tokens
    const preview = clearText.substring(0, 150).replace(/\s+/g, ' ').trim() + (clearText.length > 150 ? '...' : '');
    const tokens = tokenizeText(clearText);

    const decryptedPayload: DecryptedCachePayload = { preview, tokens };
    console.log(`[Plugin] Indexation autonome du mail ${mailId} avec ces token : ${tokens.join(', ')} tokens générés.`);
    console.log(`[Plugin] Preview générée : "${preview}"`);
    // 4. Chiffrement AES-GCM local
    const textBytes = new TextEncoder().encode(JSON.stringify(decryptedPayload));
    const iv = crypto.getRandomValues(new Uint8Array(12)); // IV unique par mail

    const encryptedPayload = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      textBytes
    );
    console.log(`[Plugin] Payload chiffré généré pour le mail ${mailId}:`, encryptedPayload);

    const encryptedRecord: EncryptedMessageCache = {
      id: mailId,
      encryptedPayload: new Uint8Array(encryptedPayload),
      iv: iv
    };
    console.log(`[Plugin] Payload final chiffré généré pour le mail ${mailId}:`, encryptedRecord);
    // 5. Sauvegarde persistante chiffrée dans IndexedDB
    await saveMessageCache(encryptedRecord);

    // 6. Envoi immédiat au Background Script pour alimenter la RAM active
    broadcastUpdateRamIndexEntry(mailId, decryptedPayload);

    console.log(`[Plugin] Le message ${mailId} a été automatiquement indexé sous la clé par défaut.`);
  } catch (error) {
    console.error(`[Plugin] Échec lors de l'indexation autonome du mail ${mailId}:`, error);
    throw error;
  }
}

export function search(query: string, index: Record<string, DecryptedCachePayload>): string[] {
    const cleanedQuery = query.toLowerCase().trim(); // Normalisation basique
        const matchingIds: string[] = [];

        if (cleanedQuery) {
          for (const [id, data] of Object.entries(index)) {
            // Recherche par correspondance de jetons (Tokens)
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