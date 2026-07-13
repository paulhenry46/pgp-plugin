import * as openpgp from 'openpgp';

/**
 * Encrypts MIME or text content for one or more recipients.
 * Automatically includes the sender's public key (sender) to allow them
 * to read back their own messages in the "Sent" folder.
 */
export async function pgpEncrypt(
  mimeBytes: Uint8Array, 
  recipientPublicKeysArmored: string[], 
  senderPublicKeyArmored: string,
  signingKey?: openpgp.PrivateKey // <-- Optional parameter added for combined signature
): Promise<Blob> {
  
  // 1. Merging and deduplication of public keys
  const allKeyStrings = deduplicateKeys([...recipientPublicKeysArmored, senderPublicKeyArmored]);
  
  if (allKeyStrings.length === 0) {
    throw new Error('No recipient or sender public key provided.');
  }

  // 2. Parsing keys for OpenPGP API
  const encryptionKeys: openpgp.PublicKey[] = [];
  
  for (const keyArmored of allKeyStrings) {
    try {
      const parsedKey = await openpgp.readKey({ armoredKey: keyArmored });
      encryptionKeys.push(parsedKey);
    } catch (e: any) {
      throw new Error(`Failed to parse public key: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (encryptionKeys.length === 0) {
    throw new Error('Failed to parse all provided public keys.');
  }

  // 3. Preparation of binary payload
  const message = await openpgp.createMessage({ binary: mimeBytes });

  // 4. Configuration of symmetric algorithm (Session Key)
  const algorithm = openpgp.enums.symmetric.aes256;

  // 5. Dynamic configuration of options object for openpgp.encrypt
  const encryptOptions: any = {
    message,
    encryptionKeys,
    config: { 
      preferredSymmetricAlgorithm: algorithm 
    }
  };

  // If a signing key is passed, we add it to the options.
  // OpenPGP.js then takes care of signing the binary payload internally before encrypting it.
  if (signingKey) {
    encryptOptions.signingKeys = signingKey;
  }

  // 6. End-to-end encryption
  const encryptedArmored = await openpgp.encrypt(encryptOptions);
  
  // 7. Returns a text Blob in standard encrypted OpenPGP format
  return new Blob([encryptedArmored as string], { type: 'application/pgp-encrypted; charset=utf-8' });
}

/**
 * Deduplicates armored key strings to avoid encrypting twice for the same key
 */
function deduplicateKeys(keys: string[]): string[] {
  const seen = new Set();
  const result: string[] = [];
  for (const key of keys) {
    if (!key) continue;
    const trimmed = key.trim();
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
}