import host from '@plugin-host';
import * as openpgp from 'openpgp'; 
import { detectPgp } from '../pgp/detect.ts'; 
import { parseMime } from '../mime/parse.ts';
import { normalizePgpMessage, PgpKeyLockedError } from '../pgp/decrypt.ts';
import { pgpVerify } from '../pgp/pgp-verify.ts';
import { scanAndImportKeysFromAttachments } from '../pgp/key-utils.ts';

import { addrList, getAvailableKeyId } from '../util.ts';
import { VERIFY_PREFIX, STATE_PREFIX } from '../shared.ts';
import { listPublicCerts } from '../storage.ts';
import { isCapable } from '../index.tsx';
import { indexAndPersistDecryptedMail } from '../cache.ts';
import { executeCryptText, executeCryptFile } from '../pgp/session-broadcast.ts';

/**
 * Point d'entrée principal pour le rendu des corps d'e-mails traités par PGP.
 * Architecture en Boîte Noire (RAM Isolation).
 */
export async function onRenderEmailBody(body: any, ctx: any) {
  if (!ctx || !(await isCapable())) return undefined;

  await host.storage.set(VERIFY_PREFIX + ctx.id, { isEncrypted: null, processing: true });

  const detection = detectPgp(ctx.contentType, ctx.bodyStructure, ctx.bodyValues, ctx.attachments, ctx.textBody);
  if (!detection.type) return undefined;

  if (!detection.supported) {
    const status = {
      isSigned: ['pgp-signature-file', 'pgp-mime-signed'].includes(detection.type),
      isEncrypted: false,
      unsupportedReason: `${host.i18n.t('error.unsupported_layout_prefix')}${detection.type}${host.i18n.t('error.unsupported_layout_suffix')}`,
    };
    await persistVerifyStatus(ctx.id, status);
    return undefined;
  }

  const blobId = detection.blobId || ctx.blobId;
  if (!blobId) return undefined;

  const fromEmail = (addrList(ctx.from)[0] || {}).email;

  try {
    const raw = await host.jmap.fetchBlob(blobId);
    const pgpMessageContent = normalizePgpMessage(raw);
    const isEncryptedCase = ['pgp-mime-encrypted', 'pgp-inline-encrypted', 'pgp-encrypted-file'].includes(detection.type);
    const isSignedCase = ['pgp-mime-signed', 'pgp-inline-signed', 'pgp-signature-file'].includes(detection.type);

    const knownPublicKeys = await loadPublicKeys(fromEmail);
    // ── Cas 1 : Chiffré (et potentiellement signé) ──
    if (isEncryptedCase) {
      await persistEmailListState(ctx.id, { isEncrypted: true, decryptionSuccess: null, processing: true });
      
      // Récupération de l'identifiant de la clé sans jamais manipuler la clé privée en clair
      const keyId = await getAvailableKeyId(fromEmail);

      if (detection.type === 'pgp-inline-encrypted') {
        return await handleInlineEncrypted(body, ctx, detection, keyId);
      } else {
        const rawBytes = await host.jmap.fetchBlob(blobId);
        const pgpMessageContent = new TextDecoder().decode(rawBytes);
        return await handleMimeEncrypted(body, ctx, pgpMessageContent, keyId);
      }
    }

    // ── Cas 2 : Signé uniquement ──
    // Note : La vérification de signature n'utilisant que des clés publiques, 
    // elle peut rester locale ou être déléguée si nécessaire.
    if (isSignedCase) {
      const signatureBlock = detection.signatureBlobId ? await host.jmap.fetchBlob(detection.signatureBlobId) : null;
      const signatureString = signatureBlock ? new TextDecoder().decode(signatureBlock) : null;

      const v = await pgpVerify(new TextEncoder().encode(pgpMessageContent), fromEmail, signatureString, knownPublicKeys);
      const parsed = parseMime(v.mimeBytes);

      await persistVerifyStatus(ctx.id, v.status);
      if (parsed.attachments) {
        await scanAndImportKeysFromAttachments(parsed.attachments);
      }

      return {
        ...body,
        handledBy: 'openpgp',
        html: parsed.html || '',
        text: parsed.text || '',
        attachments: parsed.attachments,
        verification: v.status,
      };
    }
    
  } catch (err) {
    host.log.error('onRenderEmailBody failed', err);
    return undefined;
  }

  return undefined;
}

// ── FONCTIONS ASSISTANTES EN BOÎTE NOIRE ──


async function loadPublicKeys(fromEmail: string): Promise<any[]> {
  const publicCerts = await listPublicCerts(fromEmail);
  const knownPublicKeys = [];
  for (const cert of publicCerts) {
    try {
      const readK = await openpgp.readKey({ armoredKey: cert.publicKey });
      knownPublicKeys.push(readK);
    } catch {
      /* ignore malformed public certificates safely */
    }
  }
  return knownPublicKeys;
}
/**
 * Gestionnaire pour le contenu chiffré PGP Inline et ses métadonnées JSON jointes.
 */
async function handleInlineEncrypted(body: any, ctx: any, detection: any, keyId: string) {
  let htmlBody = '';
  let textBody = '';
  let attachments = ctx.attachments;

  if (detection.htmlBody) {
    htmlBody = await executeCryptText('decrypt', detection.htmlBody, keyId) || '';
  }

  if (detection.textBody) {
    textBody = await executeCryptText('decrypt', detection.textBody, keyId) || '';

    const metadataRegex = /<--PGP_METADATA_START-->([\s\S]*?)<--PGP_METADATA_END-->/;
    const match = textBody.match(metadataRegex);

    if (match && match[1]) {
      try {
        const metadataMap: Record<string, { originalName: string; originalType: string }> = JSON.parse(match[1].trim());
        
        if (ctx.attachments && ctx.attachments.length > 0) {
          const acc = [];

          for (const att of ctx.attachments) {
            const meta = metadataMap[att.name];
            if (meta) {
              // 1. Récupération des données brutes de l'attachement
              const encryptedBytes = await host.jmap.fetchBlob(att.blobId);
              
              let arrayBuffer: ArrayBuffer;

              if (encryptedBytes.buffer instanceof ArrayBuffer) {
                // C'est un ArrayBuffer classique, on extrait la portion utile sans copier la totalité du buffer si partagé
                arrayBuffer = encryptedBytes.buffer.slice(
                  encryptedBytes.byteOffset, 
                  encryptedBytes.byteOffset + encryptedBytes.byteLength
                );
              } else {
                // Cas de secours : Si c'est un SharedArrayBuffer ou autre structure exotique, 
                // on force la création d'un ArrayBuffer standard tout neuf.
                arrayBuffer = new ArrayBuffer(encryptedBytes.byteLength);
                new Uint8Array(arrayBuffer).set(encryptedBytes);
              }

              // 3. Déchiffrement ultra-rapide en tâche de fond (0ms de duplication RAM pour 50Mo)
              const decryptedBuffer = await executeCryptFile('decrypt', arrayBuffer, keyId);

              if (decryptedBuffer) {
                const dataUrl = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = () => reject(reader.error);
                  reader.readAsDataURL(new Blob([decryptedBuffer], { type: meta.originalType }));
                });

                acc.push({
                  name: meta.originalName,
                  type: meta.originalType,
                  size: att.size || 0,
                  dataUrl,
                });
              }
            }
          }
          attachments = acc;
        }
        textBody = textBody.replace(metadataRegex, '').trim();
      } catch (e) {
        console.error(host.i18n.t('error.metadata_parse_failed'), e);
      }
    } else if (ctx.attachments && ctx.attachments.length > 0) {
      // Traitement de secours si les métadonnées structurelles sont absentes
      const acc = [];
      for (const att of ctx.attachments) {
        const encryptedBytes = await host.jmap.fetchBlob(att.blobId);
        let arrayBuffer: ArrayBuffer;
        if (encryptedBytes.buffer instanceof ArrayBuffer) {
          arrayBuffer = encryptedBytes.buffer.slice(
            encryptedBytes.byteOffset, 
            encryptedBytes.byteOffset + encryptedBytes.byteLength
          );
        } else {
          arrayBuffer = new ArrayBuffer(encryptedBytes.byteLength);
          new Uint8Array(arrayBuffer).set(encryptedBytes);
        }
        
        const decryptedBuffer = await executeCryptFile('decrypt', arrayBuffer, keyId);

        if (decryptedBuffer) {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(new Blob([decryptedBuffer], { type: att.type }));
          });

          acc.push({
            name: att.name,
            type: att.type,
            size: att.size || 0,
            dataUrl,
          });
        }
      }
      attachments = acc;
    }
  }

  const verif = { isEncrypted: true, decryptionSuccess: true, isSigned: false };
  await persistVerifyStatus(ctx.id, verif);
  await indexAndPersistDecryptedMail(ctx.id, textBody);

  return {
    ...body,
    handledBy: 'openpgp',
    html: htmlBody,
    text: textBody,
    attachments,
    verification: verif,
  };
}

/**
 * Gestionnaire pour le contenu chiffré PGP/MIME standard.
 */
async function handleMimeEncrypted(body: any, ctx: any, pgpMessageContent: string, keyId: string) {
  // Déchiffrement du bloc MIME via la couche de communication sécurisée en RAM
  const decryptedMime = await executeCryptText('decrypt', pgpMessageContent, keyId);

  if (!decryptedMime) {
    const status = {
      isEncrypted: true,
      decryptionSuccess: false,
      decryptionError: 'locked_or_failed',
    };

    await persistVerifyStatus(ctx.id, status);
    const fallbackErrorMessage = host.i18n.t('error.decrypt_failed_prefix');
    
    return {
      ...body,
      handledBy: 'openpgp',
      html: fallbackErrorMessage,
      text: fallbackErrorMessage,
      attachments: [],
      verification: status,
    };
  }

  // Le décodage de l'arborescence MIME résultante se fait sur les octets décodés
  const parsed = parseMime(new TextEncoder().encode(decryptedMime));
  
  const verification = {
    isEncrypted: true,
    decryptionSuccess: true,
    isSigned: false, // La signature peut être configurée en retour du payload si le moteur PGP background la valide
  };

  await persistVerifyStatus(ctx.id, verification);

  if (parsed.attachments) {
    await scanAndImportKeysFromAttachments(parsed.attachments);
  }
  
  await indexAndPersistDecryptedMail(ctx.id, parsed.text || parsed.html || '');
  
  return {
    ...body,
    handledBy: 'openpgp',
    html: parsed.html || '',
    text: parsed.text || '',
    attachments: parsed.attachments,
    verification,
  };
}

async function persistVerifyStatus(emailId: string, status: any) {
  if (!emailId) return;
 try { await host.storage.set(VERIFY_PREFIX + emailId, status); } catch { /* ignore */ }
}

async function persistEmailListState(emailId: string, status: any) {
  if (!emailId) return;
 try { await host.storage.set(STATE_PREFIX + emailId, status); } catch { /* ignore */ }
}