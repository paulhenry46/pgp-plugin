// used to auth and change password

import * as opaque from "@serenity-kit/opaque";
import { config } from "../../shared.ts";

/*
* Change password with SSO API
*/
export async function changePasswordAurionProcess(username :string, oldPassword :string, newPassword :string) {
  await opaque.ready;
  const SSOURL = await config('SSOURL'); 
  try {
    // =========================================================================
    // ÉTAPE 1 : Generate new RECORD 
    // =========================================================================
    
    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ 
      password: newPassword 
    });

    const resStart = await fetch(SSOURL + "/api/changePassword/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, registrationRequest }),
    });
    if (!resStart.ok) throw new Error("Échec de l'initialisation du nouveau mot de passe.");
    const { registrationResponse } = await resStart.json();

    const { registrationRecord: newRecord } = opaque.client.finishRegistration({
      clientRegistrationState,
      registrationResponse,
      password: newPassword,
    });


    // =========================================================================
    // AUTH with OLD PASSWORD to get KE3 (proof) for server
    // =========================================================================

    const { clientLoginState, startLoginRequest } = opaque.client.startLogin({ 
      password: oldPassword 
    });

    const resInit = await fetch(SSOURL + "/api/changePassword/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, startLoginRequest }),
    });
    if (!resInit.ok) throw new Error("Échec de l'initialisation de l'authentification.");
    const { sessionId: opaqueSessionId, loginResponse } = await resInit.json();

    const loginResult = opaque.client.finishLogin({
      clientLoginState,
      loginResponse,
      password: oldPassword,
    });

    if (!loginResult) {
      throw new Error("L'ancien mot de passe est incorrect.");
    }
    const { finishLoginRequest: opaqueKe3 } = loginResult;


    // =========================================================================
    // SEND new RECORD + KE3 to server to change password
    // =========================================================================

    const resChange = await fetch(SSOURL + "/api/changePassword/change", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        opaqueSessionId,
        opaqueKe3,
        newRecord
      }),
    });

    const finalResult = await resChange.json();

    if (!resChange.ok) {
      throw new Error(finalResult.error || "Erreur lors du changement de mot de passe.");
    }

    console.log("Mot de passe changé avec succès !");
    return finalResult; // { success: true }

  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    throw error;
  }
}