const PRF_SALT = new TextEncoder().encode("bulwark-pgp-salt-v1");

/**
 * Étape A : Créer un nouveau Passkey et récupérer le premier secret PRF
 */
export async function registerWebAuthnPRF(email: string): Promise<{ credentialId: ArrayBuffer; prfSecret: ArrayBuffer }> {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Bulwark Webmail", id: window.location.hostname },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: email,
        displayName: `PGP Key (${email})`
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256 (indispensable pour FIDO2)
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Force TouchID/Windows Hello/Gestionnaire local
        userVerification: "required"
      },
      extensions: {
        prf: { eval: { first: PRF_SALT } }
      } as any
    }
  }) as PublicKeyCredential;

  const outputs = credential.getClientExtensionResults();
  const prfSecret = (outputs as any).prf?.results?.first;

  if (!prfSecret) {
    throw new Error("L'extension WebAuthn PRF n'est pas supportée par votre navigateur ou gestionnaire.");
  }

  return {
    credentialId: credential.rawId,
    prfSecret
  };
}

/**
 * Étape B : Solliciter le Passkey existant pour obtenir le MÊME secret PRF
 */
export async function getWebAuthnPRF(credentialId: ArrayBuffer): Promise<ArrayBuffer> {
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{
        type: "public-key",
        id: credentialId
      }],
      userVerification: "required",
      extensions: {
        prf: { eval: { first: PRF_SALT } }
      } as any
    }
  }) as PublicKeyCredential;

  const outputs = assertion.getClientExtensionResults();
  const prfSecret = (outputs as any).prf?.results?.first;

  if (!prfSecret) {
    throw new Error("Impossible de récupérer le secret cryptographique depuis WebAuthn.");
  }

  return prfSecret;
}