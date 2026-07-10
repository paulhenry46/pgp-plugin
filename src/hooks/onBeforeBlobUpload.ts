import host from '@plugin-host';
import { pgpEncrypt } from '../pgp/encrypt.ts';

import {
   getDefaultPublicCert
} from '../storage.ts';
import {settings} from '../shared.ts';
 
 
 export async function onBeforeBlobUpload(fileId: string) {
  if(settings().encryptDrafts !== true) return fileId;
  const file = await host.upfiles.get(fileId);
  if (!file) return;
  // Get the pub key
  const key = (await getDefaultPublicCert())?.publicKey
  if (!key) {
    host.toast.error('No default public key found for attachment encryption. Please set a default public key in OpenPGP settings.');  
    return}
  const fileBytes = await file.bytes();
  const encryptedBlob: Blob = await pgpEncrypt(
      fileBytes, 
      [], 
      key
      
    );
  const encryptedFile = new File([encryptedBlob], `encrypted.pgp`, {
      type: 'application/octet-stream'
    });
    
    return await host.upfiles.save(fileId, encryptedFile);
}