
import { pgpEncrypt } from '../pgp/encrypt.ts';
import {  generateUUID } from '../util.ts';
import {
  getDefaultPublicCert
} from '../storage.ts';
import {settings} from '../shared.ts';

interface AlmostSavedDraft{
   to: string[],
    subject: string,
    body: string,
    cc?: string[],
    bcc?: string[],
    identityId?: string,
    fromEmail?: string,
    draftId?: string,
    attachments?: Array<{ blobId: string; name: string; type: string; size: number; disposition?: 'attachment' | 'inline'; cid?: string }>,
    fromName?: string,
    htmlBody?: string
}

 export async function onBeforeDraftAutoSave(draft: AlmostSavedDraft): Promise<AlmostSavedDraft> {
  if(settings().encryptDrafts !== true) return draft;

  // pub key
  const key = (await getDefaultPublicCert())?.publicKey || '';
  console.log('Default public key for draft auto-save:', key);
  const modifiedDraft = JSON.parse(JSON.stringify(draft)) as AlmostSavedDraft;

  // Si aucun attachement, on retourne le draft tel quel
  if (modifiedDraft.attachments && modifiedDraft.attachments.length > 0) {

  // 1. Initialisation de la table de correspondance
  const metadataMap: Record<string, { originalName: string; originalType: string }> = {};

  // 2. Parcours et modification des pièces jointes
  modifiedDraft.attachments = modifiedDraft.attachments.map((attachement) => {
    const randomName = `${generateUUID()}`; // Exemple: "550e8400-e29b-41d4-a716-446655440000"
    
    // On sauvegarde les vraies infos en liant au blobId (ou au randomName, mais le blobId reste stable)
    metadataMap[randomName] = {
      originalName: attachement.name,
      originalType: attachement.type
    };

    // On anonymise l'attachement qui sera visible par le serveur
    return {
      ...attachement,
      name: randomName,
      type: 'application/octet-stream'
    };
  });

  // 3. Préparation du bloc JSON de métadonnées avec ses balises uniques
  const metadataJson = JSON.stringify(metadataMap);
  const metadataPayload = `\n<--PGP_METADATA_START-->${metadataJson}<--PGP_METADATA_END-->`;

  // 4. Injection à la fin du body textuel
  modifiedDraft.body = (modifiedDraft.body || '') + metadataPayload;
  }
  const encoder = new TextEncoder();
  const bodyBytes = encoder.encode(modifiedDraft.body);

  const encryptedBodyBlob = await pgpEncrypt(
      bodyBytes, 
      [], 
      key
    );
  modifiedDraft.body = await encryptedBodyBlob.text();

  if (modifiedDraft.htmlBody) {
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(modifiedDraft.htmlBody);
    
    // Appel de votre fonction pgpEncrypt
    const encryptedHtmlBlob = await pgpEncrypt(
      htmlBytes, 
      [], 
      key
    );
    
    modifiedDraft.htmlBody = await encryptedHtmlBlob.text();
  }

  return modifiedDraft;
}