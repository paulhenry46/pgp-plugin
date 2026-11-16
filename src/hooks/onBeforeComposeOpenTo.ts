import { onRenderEmailBody } from "./onRenderEmailBody.ts";
import { Email, MimeParsedAttachment } from "../types.ts";
import host from "@plugin-host";
import { config, settings } from "../shared.ts";
import { getDefaultPublicKeyForEncryption } from "../storage.ts";
import { pgpEncrypt } from "../pgp/encrypt.ts";

export async function common(email: Email, withAttachments: boolean): Promise<Email> {
    const initialBody = { html: '', text: '', attachments: [] as unknown[] };
    const rawContentType = email.headers?.['content-type'] || email.headers?.['Content-Type'];
    
    const ctx = {
        id: email.id,
        contentType: Array.isArray(rawContentType) ? rawContentType[0] : rawContentType,
        bodyStructure: email.bodyStructure,
        bodyValues: email.bodyValues,
        attachments: email.attachments,
        blobId: email.blobId,
        from: email.from,
    };

    const result = await onRenderEmailBody(initialBody, ctx);
    if (!result || typeof result !== 'object') {
        return email;
    }

    const updatedEmail: Email = { ...email };

    const htmlBody = result.html || '';
    const textBody = result.text || '';
    const attachments = (result.attachments as MimeParsedAttachment[]) || [];

    const encoder = new TextEncoder();

    if (htmlBody) {
        updatedEmail.htmlBody = [{
            partId: 'pgp-rendered-html',
            blobId: '',
            size: encoder.encode(htmlBody).byteLength,
            type: 'text/html',
        }];
        updatedEmail.bodyValues = {
            ...updatedEmail.bodyValues,
            'pgp-rendered-html': { value: htmlBody },
        };
    }

    if (textBody) {
        updatedEmail.textBody = [{
            partId: 'pgp-rendered-text',
            blobId: '',
            size: encoder.encode(textBody).byteLength,
            type: 'text/plain',
        }];
        updatedEmail.bodyValues = {
            ...updatedEmail.bodyValues,
            'pgp-rendered-text': { value: textBody },
        };
    }

    let processedAttachments: any[] = [];

    if (withAttachments && attachments.length > 0) {
        const shouldEncrypt = Boolean(settings().encryptDrafts) || Boolean(await config('forceDraftAndAttachmentsEncryption'));
        let encryptionKey: string | undefined = undefined;

        if (shouldEncrypt) {
            encryptionKey = await getDefaultPublicKeyForEncryption();
            if (!encryptionKey) {
                host.toast.error(host.i18n.t('error.no_default_public_key_attachment'));  
                throw new Error('No default public key for encryption');
            }
        }

        processedAttachments = await Promise.all(
            attachments.map(async (att) => {
                if (!att.dataUrl?.startsWith('data:')) {
                    throw new Error('Invalid or missing data URL in attachment');
                }

                let binaryData = dataUrlToUint8Array(att.dataUrl);

                if (shouldEncrypt && encryptionKey) {
                    const encryptedBlob: Blob = await pgpEncrypt(binaryData, [], encryptionKey);
                    binaryData = new Uint8Array(await encryptedBlob.arrayBuffer());
                }

                const mimeType =att.type;// shouldEncrypt ? 'application/octet-stream' : (att.type || 'application/octet-stream');
                const name = att.name;//shouldEncrypt ? `encrypted.pgp` : (att.name || 'unknown');
                const uploadResult = await host.jmap.uploadBlob(binaryData, 'unknown', 'application/octet-stream');

                return {
                    partId: `pgp-${uploadResult.blobId}`,
                    blobId: uploadResult.blobId,
                    size: binaryData.byteLength,
                    name: name,
                    type: mimeType,
                    disposition: 'attachment',
                };
            })
        );
    }

    updatedEmail.attachments = processedAttachments;
    updatedEmail.hasAttachment = processedAttachments.length > 0;

    const subParts: any[] = [];
    if (updatedEmail.htmlBody) subParts.push(...updatedEmail.htmlBody);
    if (updatedEmail.textBody) subParts.push(...updatedEmail.textBody);
    if (processedAttachments.length > 0) subParts.push(...processedAttachments);

    updatedEmail.bodyStructure = {
        partId: null,
        blobId: null,
        type: 'multipart/mixed',
        subParts: subParts,
    } as any;

    return updatedEmail;
}

export async function onBeforeComposeOpenToReply(email:Email): Promise<Email> {
    return await common(email, false);
}

export async function onBeforeComposeOpenToReplyAll(email:Email): Promise<Email> {
    return await common(email, false);
}

export async function onBeforeComposeOpenToForward(email:Email): Promise<Email> {
    return await common(email, true);
}

export async function onBeforeComposeOpenToForwardAttachments(email:Email): Promise<Email> {
    //for now, we don't decrypt attachments. It would require decrypt the mime and upload it
    return email
}


function dataUrlToUint8Array(dataUrl: string): Uint8Array {
    const base64Index = dataUrl.indexOf(';base64,');
    if (base64Index === -1) {
        throw new Error('Invalid data URL');
    }
    const base64 = dataUrl.slice(base64Index + 8);
    
        if (typeof Uint8Array.fromBase64 === 'function') {
            return Uint8Array.fromBase64(base64);
        }

    if (typeof atob === 'function') {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
    
    // Si Buffer est disponible (environnement type Node / Deno)
    if (typeof Buffer !== 'undefined') {
        return new Uint8Array(Buffer.from(base64, 'base64'));
    }

    throw new Error('No base64 decoder available in plugin environment');
}