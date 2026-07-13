
import { pgpEncrypt } from '../pgp/encrypt.ts';
import {  generateUUID } from '../util.ts';
import {
  getDefaultPublicKeyForEncryption
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

  const key = await getDefaultPublicKeyForEncryption();
  if(!key) return draft; // If no key is found, return the draft as is
  const modifiedDraft = JSON.parse(JSON.stringify(draft)) as AlmostSavedDraft;

  if (modifiedDraft.attachments && modifiedDraft.attachments.length > 0) {

  const metadataMap: Record<string, { originalName: string; originalType: string }> = {};

  modifiedDraft.attachments = modifiedDraft.attachments.map((attachement) => {
    const randomName = `${generateUUID()}`; 
    
    metadataMap[randomName] = {
      originalName: attachement.name,
      originalType: attachement.type
    };

    return {
      ...attachement,
      name: randomName,
      type: 'application/octet-stream'
    };
  });

  const metadataJson = JSON.stringify(metadataMap);
  const metadataPayload = `\n<--PGP_METADATA_START-->${metadataJson}<--PGP_METADATA_END-->`;

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
    
    const encryptedHtmlBlob = await pgpEncrypt(
      htmlBytes, 
      [], 
      key
    );
    
    modifiedDraft.htmlBody = await encryptedHtmlBlob.text();
  }

  return modifiedDraft;
}