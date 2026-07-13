import { settings } from '../shared.ts';
import { getAvailableKeyId } from '../util.ts';
import { executeCryptText } from '../pgp/session-broadcast.ts';

export async function onBeforeEditDraft(email: any): Promise<any> {
  if (settings().encryptDrafts !== true) return email;

  console.log('Editing draft email:', email);
  const modifiedEmail = { ...email };
  
  // Résolution de l'ID de clé de l'utilisateur sans extraire la clé privée
  const keyId = await getAvailableKeyId(modifiedEmail.from?.email);
  if (!keyId) return email;

  const indexText = modifiedEmail.textBody[0]?.partId;
  const indexHtml = modifiedEmail.htmlBody[0]?.partId;

  // --- DÉCHIFFREMENT DU CORPS TEXTE VIA BACKGROUND ---
  const encryptedText = modifiedEmail.bodyValues?.[indexText]?.value;
  if (encryptedText) {
    // Appel à la boîte noire en RAM
    let text = await executeCryptText('decrypt', encryptedText, keyId);
    
    if (text) {
      console.log('Decrypted text body from background successfully');
      
      // --- RESTAURATION DES ATTACHEMENTS ---
      if (modifiedEmail.hasAttachment) {
        const metadataRegex = /<--PGP_METADATA_START-->([\s\S]*?)<--PGP_METADATA_END-->/;
        const match = text.match(metadataRegex);

        if (match && match[1]) {
          try {
            const metadataMap: Record<string, { originalName: string; originalType: string }> = JSON.parse(match[1].trim());

            if (modifiedEmail.bodyStructure && Array.isArray(modifiedEmail.bodyStructure.subParts)) {
              modifiedEmail.bodyStructure.subParts = modifiedEmail.bodyStructure.subParts.map((subPart: any, index: number) => {
                if (index >= 1 && subPart.blobId) {
                  const meta = metadataMap[subPart.blobId];
                  if (meta) {
                    return { ...subPart, name: meta.originalName, type: meta.originalType };
                  }
                }
                return subPart;
              });
            }

            if (Array.isArray(modifiedEmail.attachments)) {
              modifiedEmail.attachments = modifiedEmail.attachments.map((attachment: any) => {
                if (attachment.blobId && metadataMap[attachment.blobId]) {
                  return {
                    ...attachment,
                    name: metadataMap[attachment.blobId].originalName,
                    type: metadataMap[attachment.blobId].originalType
                  };
                }
                return attachment;
              });
            }

            text = text.replace(metadataRegex, '').trim();
          } catch (e) {
            console.error("Erreur lors du parsing des métadonnées PGP :", e);
          }
        }
      }
      modifiedEmail.bodyValues[indexText].value = text;
    }
  }

  // --- DÉCHIFFREMENT DU CORPS HTML VIA BACKGROUND ---
  const encryptedHtml = modifiedEmail.bodyValues?.[indexHtml]?.value;
  if (encryptedHtml) {
    const html = await executeCryptText('decrypt', encryptedHtml, keyId);
    if (html) {
      modifiedEmail.bodyValues[indexHtml].value = html;
    }
  }

  return modifiedEmail;
}