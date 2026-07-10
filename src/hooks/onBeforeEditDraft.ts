
import { pgpDecrypt } from '../pgp/decrypt.ts';

import {settings} from '../shared.ts';
import { unlockedDecryptMaps } from '../util.ts';

export async function onBeforeEditDraft(email: any): Promise<any> {
  if(settings().encryptDrafts !== true) return email;

  console.log('Editing draft email:', email);
  // 1. Cloner l'objet pour éviter de muter l'original de manière imprévue
  const modifiedEmail = { ...email };
  const { keyRecords, unlockedKeys } = await unlockedDecryptMaps();
  console.log(keyRecords, unlockedKeys);
  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder();
  const indexText = modifiedEmail.textBody[0].partId;
  const indexHtml = modifiedEmail.htmlBody[0].partId;
  // --- DÉCHIFFREMENT DU CORPS TEXTE (Clé 1) ---
  const encryptedText = modifiedEmail.bodyValues?.[indexText]?.value;
  if (encryptedText) {
    const encryptedTextBytes = encoder.encode(encryptedText);   

    const decryptedTextResult = await pgpDecrypt({
      cmsBytes: encryptedTextBytes,
      keyRecords: keyRecords,       
      unlockedKeys: unlockedKeys,   
      knownPublicKeys: []              
    });

    let text = decoder.decode(decryptedTextResult.mimeBytes);
    console.log('Decrypted text body:', text);
    // --- RESTAURATION DES ATTACHEMENTS ---
    if (modifiedEmail.hasAttachment) {
      const metadataRegex = /<--PGP_METADATA_START-->([\s\S]*?)<--PGP_METADATA_END-->/;
      const match = text.match(metadataRegex);

      if (match && match[1]) {
        try {
          const metadataMap: Record<string, { originalName: string; originalType: string }> = JSON.parse(match[1].trim());

          // Restauration dans bodyStructure.subParts (Index >= 1)
          if (modifiedEmail.bodyStructure && Array.isArray(modifiedEmail.bodyStructure.subParts)) {
            modifiedEmail.bodyStructure.subParts = modifiedEmail.bodyStructure.subParts.map((subPart: any, index: number) => {
              if (index >= 1 && subPart.blobId) {
                const meta = metadataMap[subPart.blobId];
                if (meta) {
                  return {
                    ...subPart,
                    name: meta.originalName,
                    type: meta.originalType
                  };
                }
              }
              return subPart;
            });
          }

          // Restauration dans la liste racine des attachments
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

          // Nettoyage final du texte : suppression du JSON et de ses balises
          text = text.replace(metadataRegex, '').trim();

        } catch (e) {
          console.error("Erreur lors du parsing des métadonnées PGP :", e);
        }
      }
    }

    // Sauvegarde du texte nettoyé
    modifiedEmail.bodyValues[indexText].value = text;
  }
  console.log('Modified text after all:', modifiedEmail.bodyValues[indexText].value);

  // --- DÉCHIFFREMENT DU CORPS HTML (Clé 2) ---
  const encryptedHtml = modifiedEmail.bodyValues?.[indexHtml]?.value;
  if (encryptedHtml) {
    const encryptedHtmlBytes = encoder.encode(encryptedHtml);  
    
    const decryptedHtmlResult = await pgpDecrypt({
      cmsBytes: encryptedHtmlBytes,
      keyRecords: keyRecords,       
      unlockedKeys: unlockedKeys,   
      knownPublicKeys: []             
    });

    modifiedEmail.bodyValues[indexHtml].value = decoder.decode(decryptedHtmlResult.mimeBytes);
  }
console.log('Modified email after decryption and restoration:', modifiedEmail);
  return modifiedEmail;
}