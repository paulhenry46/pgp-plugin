export async function encryptPassphraseWithWebAuthn(passphrase: string, prfSecret: ArrayBuffer): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const aesKey = await crypto.subtle.importKey("raw", prfSecret, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(passphrase)
  );
  return { ciphertext, iv };
}

export async function decryptPassphraseWithWebAuthn(encryptedData: ArrayBuffer, prfSecret: ArrayBuffer, iv: ArrayBuffer): Promise<string> {
  const aesKey = await crypto.subtle.importKey("raw", prfSecret, "AES-GCM", false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encryptedData
  );
  return new TextDecoder().decode(decrypted);
}