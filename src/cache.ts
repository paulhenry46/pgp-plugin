import { DecryptedCachePayload, getAllMessageCache, EncryptedMessageCache, saveMessageCache, listKeyRecords } from "./storage.ts";
import { executeCacheAction } from "./pgp/session-broadcast.ts";

/**
 * Charge l'intégralité du cache chiffré depuis IndexedDB, délègue le déchiffrement en lot
 * au Background (Boîte Noire) et initialise l'index de recherche en RAM.
 */
export async function getIndex(): Promise<void> {
  try {
    const allEncryptedCache = await getAllMessageCache();
    if (allEncryptedCache.length === 0) return;

    // Transformation structurelle pour sérialisation via le canal de diffusion
    const payloadBatch = allEncryptedCache.map(item => ({
      id: item.id,
      encryptedPayload: item.encryptedPayload,
      iv: item.iv
    }));

    // Demande au Background de déchiffrer le lot complet avec sa clé AES isolée
    // Cette action initialise également l'index RAM du Background en interne.
    await executeCacheAction('decrypt-batch', payloadBatch);
    console.log(`[Cache] Cache global envoyé au Background pour déchiffrement (${allEncryptedCache.length} items).`);
  } catch (dbErr) {
    console.error("[Cache] Erreur lors de la récupération ou de la délégation de l'index persistant :", dbErr);
  }
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
 * Calcule les métadonnées en clair et délègue le chiffrement AES au Background.
 */
export async function indexAndPersistDecryptedMail(
  mailId: string, 
  clearText: string
): Promise<void> {
  try {
    const allKeys = await listKeyRecords();
    const defaultKey = allKeys.find((k) => k.default === true);

    if (!defaultKey) {
      console.warn(`[Cache] Impossible d'indexer le mail ${mailId} : Aucune clé PGP par défaut n'est configurée.`);
      return;
    }

    // 1. Génération de la Preview et des Tokens en clair côté Iframe
    const preview = clearText.substring(0, 150).replace(/\s+/g, ' ').trim() + (clearText.length > 150 ? '...' : '');
    const tokens = tokenizeText(clearText);
    const decryptedPayload: DecryptedCachePayload = { preview, tokens };

    // 2. Demande de chiffrement au Background (Boîte Noire AES)
    // Le background chiffre et renvoie le payload chiffré + l'IV unique généré chez lui.
    const encryptionResult = await executeCacheAction('encrypt-entry', {
      id: mailId,
      payload: decryptedPayload
    });

    if (!encryptionResult) {
      console.warn(`[Cache] Le Background a refusé le chiffrement. Clé AES verrouillée ?`);
      return;
    }

    const encryptedRecord: EncryptedMessageCache = {
      id: mailId,
      encryptedPayload: encryptionResult.encryptedPayload,
      iv: encryptionResult.iv
    };

    // 3. Sauvegarde persistante de la structure chiffrée reçue dans l'IndexedDB locale
    await saveMessageCache(encryptedRecord);
    console.log(`[Cache] Le message ${mailId} a été indexé et chiffré via le Background de manière étanche.`);
  } catch (error) {
    console.error(`[Cache] Échec lors de l'indexation autonome du mail ${mailId}:`, error);
    throw error;
  }
}

/**
 * Recherche synchrone basée sur un index local (fourni par l'UI ou l'état synchronisé).
 */
export function search(query: string, index: Record<string, DecryptedCachePayload>): string[] {
  const cleanedQuery = query.toLowerCase().trim();
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

/**
 * Extraction synchrone des résumés textuels depuis un dictionnaire d'index.
 */
export function getPreview(emailIds: string[], index: Record<string, DecryptedCachePayload>): Record<string, string> {
  const previewsResult: Record<string, string> = {};
  for (const id of emailIds) {
    if (index[id]) {
      previewsResult[id] = index[id].preview;
    }
  }
  return previewsResult;
}