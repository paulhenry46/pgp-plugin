const ENCRYPTION_ALGO = 'AES-GCM';
const HKDF_SALT = new Uint8Array(16); // Salt fixe de 16 octets à zéro pour le protocole

/**
 * Reconstruit la clé AES-256-GCM non-extractable à partir du seed.
 */
export async function deriveKeyFromSeed(seedBytes: BufferSource) {
  const hkdfMasterKey = await window.crypto.subtle.importKey(
    'raw',
    seedBytes,
    'HKDF',
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: HKDF_SALT,
      info: new TextEncoder().encode('AURION-0K-SECRET-V1')
    },
    hkdfMasterKey,
    { name: ENCRYPTION_ALGO, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Convertisseurs Hex <-> Uint8Array
export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBuffer(hexString: string): Uint8Array {
    const result = hexString.match(/.{1,2}/g);
    if (!result) {
        throw new Error("Invalid hex string");
    }
  return new Uint8Array(result.map((byte: string) => parseInt(byte, 16)));
}