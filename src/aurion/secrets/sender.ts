import { deriveKeyFromSeed, bufferToHex } from './common.js';

export async function processSecret(secretValue: string) {
  // 1. Génération de l'entropie
  const seed = window.crypto.getRandomValues(new Uint8Array(32));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // 2. Dérivation de la clé
  const key = await deriveKeyFromSeed(seed);

  // 3. Chiffrement
  const encodedSecret = new TextEncoder().encode(secretValue);
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedSecret
  );

  const ciphertextHex = bufferToHex(ciphertextBuffer);
  const ivHex = bufferToHex(iv);
  const seedHex = bufferToHex(seed);

  return { ciphertextHex, ivHex, seedHex };
}

export async function sendToBridgeIframe(url: string, origin: string, payload: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.display = 'none';

    const cleanup = () => {
      window.removeEventListener('message', handleConfirmation);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };

    const handleConfirmation = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      if (event.data?.type === 'WRITE_SUCCESS') {
        cleanup();
        resolve();
      }
      if (event.data?.type === 'WRITE_ERROR') {
        cleanup();
        reject();
      }
    };

    window.addEventListener('message', handleConfirmation);

    iframe.onload = () => {
      iframe.contentWindow?.postMessage(payload, origin);
    };

    iframe.onerror = (err) => {
      cleanup();
      reject(err);
    };

    document.body.appendChild(iframe);
  });
}