const PRF_SALT = new TextEncoder().encode("bulwark-pgp-salt-v1");

/**
 * Étape A : Créer un nouveau Passkey et récupérer le premier secret PRF
 */
export async function registerWebAuthnPRF(email: string): Promise<{ credentialId: ArrayBuffer; prfSecret: ArrayBuffer }> {
  // 🔍 LOGS DIAGNOSTIQUES
  console.group("🔍 DIAGNOSTIC WEBAUTHN DANS IFRAME");
  console.log("1. Contexte de la fenêtre :", window.top === window ? "Top-Level (Pas d'IFrame)" : "Dans une IFrame");
  console.log("2. Origine de cette IFrame (window.location.origin) :", window.location.origin);
  console.log("3. Nom d'hôte calculé pour le rp.id :", window.location.hostname);
  
  try {
    console.log("4. Origine parente (si accessible) :", window.parent.location.origin);
  } catch (e) {
    console.warn("4. Origine parente inaccessible (Cross-Origin stricte détectée par le navigateur)");
  }
  
  // Vérification de la présence d'une interaction utilisateur active
  if (navigator.userActivation) {
    console.log("5. Interaction utilisateur active (Transient Activation) :", navigator.userActivation.isActive);
  }
  console.groupEnd();

  // Exécution avec capture détaillée de l'erreur
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "Bulwark Webmail", id: window.location.hostname },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: email,
          displayName: `PGP Key (${email})`
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        extensions: {
          prf: { eval: { first: PRF_SALT } }
        } as any
      }
    }) as PublicKeyCredential;

    const outputs = credential.getClientExtensionResults();
    const prfSecret = (outputs as any).prf?.results?.first;

    if (!prfSecret) throw new Error("L'extension WebAuthn PRF n'est pas supportée.");
    return { credentialId: credential.rawId, prfSecret };

  } catch (error: any) {
    console.group("❌ ERREUR WEBAUTHN CAPTURÉE");
    console.error("Message :", error.message);
    console.error("Nom de l'erreur :", error.name);
    console.error("Stack Trace complet :", error.stack);
    console.groupEnd();
    throw error;
  }
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