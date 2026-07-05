/**
 * OpenPGP message encryption implementation.
 * Replaces the legacy S/MIME CMS EnvelopedData generator.
 */

import * as openpgp from 'openpgp';

/**
 * Chiffre un contenu MIME ou textuel pour un ou plusieurs destinataires.
 * Inclut automatiquement la clé publique de l'expéditeur (sender) pour lui permettre
 * de relire ses propres messages dans le dossier "Messages envoyés".
 * * @param {Uint8Array} mimeBytes - Les octets du message à chiffrer.
 * @param {string[]} recipientPublicKeysArmored - Liste des clés publiques des destinataires (format ASCII Armored).
 * @param {string} senderPublicKeyArmored - Clé publique de l'expéditeur (format ASCII Armored).
 * @param {boolean} useAes128 - Si true, force AES-128, sinon utilise le standard AES-256.
 * @returns {Promise<Blob>} Un blob contenant le message chiffré au format ASCII Armored.
 */
export async function pgpEncrypt(
  mimeBytes: Uint8Array, 
  recipientPublicKeysArmored: string[], 
  senderPublicKeyArmored: string, 
  useAes128: boolean,
  signingKey?: openpgp.PrivateKey // <-- Paramètre optionnel ajouté pour la signature combinée
): Promise<Blob> {
  
  // 1. Fusion et dédoublonnement des clés publiques
  const allKeyStrings = deduplicateKeys([...recipientPublicKeysArmored, senderPublicKeyArmored]);
  
  if (allKeyStrings.length === 0) {
    throw new Error('Aucune clé publique de destinataire ou d’expéditeur fournie.');
  }

  // 2. Parsing des clés pour l'API OpenPGP
  const encryptionKeys: openpgp.PublicKey[] = [];
  
  for (const keyArmored of allKeyStrings) {
    try {
      const parsedKey = await openpgp.readKey({ armoredKey: keyArmored });
      encryptionKeys.push(parsedKey);
    } catch (e: any) {
      console.warn(`Impossible de lire une clé publique, elle sera ignorée: ${e.message}`);
    }
  }

  if (encryptionKeys.length === 0) {
    throw new Error('Échec du parsing de toutes les clés publiques fournies.');
  }

  // 3. Préparation du payload binaire
  const message = await openpgp.createMessage({ binary: mimeBytes });

  // 4. Configuration de l'algorithme symétrique (Session Key)
  const algorithm = useAes128 ? openpgp.enums.symmetric.aes128 : openpgp.enums.symmetric.aes256;

  // 5. Configuration dynamique de l'objet d'options pour openpgp.encrypt
  const encryptOptions: any = {
    message,
    encryptionKeys,
    config: { 
      preferredSymmetricAlgorithm: algorithm 
    }
  };

  // Si une clé de signature est passée, on l'ajoute dans les options.
  // OpenPGP.js s'occupe alors de signer le payload binaire en interne avant de le chiffrer.
  if (signingKey) {
    encryptOptions.signingKeys = signingKey;
  }

  // 6. Chiffrement de bout en bout
  const encryptedArmored = await openpgp.encrypt(encryptOptions);

  console.log('message:', message);
  console.log('message encrypted:', encryptedArmored);
  
  // 7. Retourne un Blob texte au format standard OpenPGP chiffré
  return new Blob([encryptedArmored as string], { type: 'application/pgp-encrypted; charset=utf-8' });
}

/**
 * Dédoublonne les chaînes de clés blindées pour éviter de chiffrer deux fois pour la même clé
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