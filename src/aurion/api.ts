import { KeyRecord, EncryptedMessageCache } from '../storage.ts';
import { bufferToBase64, base64ToBuffer } from '../util.ts';
import host from '@plugin-host';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface BridgeSecretCreated {
  id: string;
  expiresAt: string;
}

export interface BridgeSecretRetrieved {
  id: string;
  encryptedData: string;
}

// Représentation réseau du Vault (où les ArrayBuffer/Uint8Array sont en string Base64)
export interface NetworkVaultPayload {
  format: string;
  version: number;
  createdAt: string;
  keys?: any[]; // KeyRecord avec des strings au lieu des ArrayBuffers
  messageCache?: any[]; // EncryptedMessageCache avec des strings
}

const base64ToUint8Array = (base64: string): Uint8Array => {
  const result = base64ToBuffer(base64);
  if (result) return new Uint8Array(result);
  return new Uint8Array();
};

export class AurionAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Définit le token JWT à utiliser pour les requêtes authentifiées
   */
  public setToken(token: string) {
    this.token = token;
  }

  /**
   * Supprime le token JWT (Déconnexion)
   */
  public clearToken() {
    this.token = null;
  }

  public getToken(): string | null {
    return this.token;
  }

  /**
   * Fonction utilitaire interne pour faire les requêtes `fetch`
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    const fullUrl = `${this.baseUrl}${endpoint}`;
    host.log.info(`AurionAPI Request: ${method} ${fullUrl}`, options);

    // 1. Préparation des headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // 2. Execution via host.http.fetch (reçoit n'importe quel verbe HTTP : GET, POST, PUT...)
    const res = await host.http.fetch(fullUrl, {
      method,
      headers,
      body: typeof options.body === 'string' ? options.body : undefined,
    });

    // 3. Extraction et parsing du JSON
    let parsedData: any = null;
    if (res.bodyText) {
      try {
        parsedData = JSON.parse(res.bodyText);
      } catch {
        // Le corps n'est pas du JSON valide
      }
    }

    // 4. Traitement des erreurs HTTP
    if (!res.ok) {
      let errorMessage = `HTTP Error ${res.status}`;
      if (parsedData && parsedData.error) {
        errorMessage = parsedData.error;
      }
      if (res.status === 401 || parsedData?.action === 'logout') {
        this.clearToken();
        host.storage.set('logoutRequired', Date.now());
        host.user.logout();
      }
      throw new Error(errorMessage);
    }

    return parsedData as T;
  }

  // ==========================================
  // 1. AUTHENTICATION
  // ==========================================

  public async login(token: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ token: token }),
    });

    // Auto-configuration du token après un login réussi
    this.setToken(data.token);
    return data;
  }

  public async logoutOthers(): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/api/auth/logout-others', {
      method: 'POST',
    });

    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  // ==========================================
  // 2. PGP VAULT
  // ==========================================

  public async getVault(): Promise<{ keys: KeyRecord[]; messageCache: EncryptedMessageCache[] }> {
    const data = await this.request<NetworkVaultPayload>('/api/vault', {
      method: 'GET',
    });

    // Reconversion du JSON (Base64) vers les interfaces du plugin (ArrayBuffer/Uint8Array)
    const keys: KeyRecord[] = (data.keys || []).map((k: any) => ({
      ...k,
      encryptedPrivateKey: base64ToBuffer(k.encryptedPrivateKey),
      salt: base64ToBuffer(k.salt),
      iv: base64ToBuffer(k.iv),
      aesSalt: k.aesSalt ? base64ToBuffer(k.aesSalt) : undefined,
      webauthn: k.webauthn
        ? {
            credentialId: base64ToBuffer(k.webauthn.credentialId),
            encryptedPassphrase: base64ToBuffer(k.webauthn.encryptedPassphrase),
            iv: base64ToBuffer(k.webauthn.iv),
          }
        : undefined,
    }));

    const messageCache: EncryptedMessageCache[] = (data.messageCache || []).map((m: any) => ({
      ...m,
      encryptedPayload: base64ToUint8Array(m.encryptedPayload),
      iv: base64ToUint8Array(m.iv),
    }));

    return { keys, messageCache };
  }

  public async addMessage(messageCache: EncryptedMessageCache): Promise<{ status: string }> {
    const networkCache = [
      {
        ...messageCache,
        encryptedPayload: bufferToBase64(messageCache.encryptedPayload),
        iv: bufferToBase64(messageCache.iv),
      },
    ];

    const payload: NetworkVaultPayload = {
      format: 'openpgp-plugin-backup',
      version: 7,
      createdAt: new Date().toISOString(),
      messageCache: networkCache,
    };

    return this.request<{ status: string }>('/api/vault', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async addMessages(messageCaches: EncryptedMessageCache[]): Promise<{ status: string }> {
    const networkCache = messageCaches.map((messageCache) => ({
      ...messageCache,
      encryptedPayload: bufferToBase64(messageCache.encryptedPayload),
      iv: bufferToBase64(messageCache.iv),
    }));

    const payload: NetworkVaultPayload = {
      format: 'openpgp-plugin-backup',
      version: 7,
      createdAt: new Date().toISOString(),
      messageCache: networkCache,
    };

    return this.request<{ status: string }>('/api/vault', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteCachedMessages(messageIds: string[]): Promise<{ status: string; deleted: number }> {
    return this.request<{ status: string; deleted: number }>('/api/vault/cache/messages', {
      method: 'DELETE',
      body: JSON.stringify({ message_ids: messageIds }),
    });
  }

  public async clearMessageCache(): Promise<{ status: string; deleted: number }> {
    return this.request<{ status: string; deleted: number }>('/api/vault/cache', {
      method: 'DELETE',
    });
  }

  public async updateKeys(keys: KeyRecord[]): Promise<{ status: string }> {
    const networkKeys = keys?.map((k) => ({
      ...k,
      encryptedPrivateKey: bufferToBase64(k.encryptedPrivateKey),
      salt: bufferToBase64(k.salt),
      iv: bufferToBase64(k.iv),
      aesSalt: k.aesSalt ? bufferToBase64(k.aesSalt) : undefined,
      webauthn: k.webauthn
        ? {
            credentialId: bufferToBase64(k.webauthn.credentialId),
            encryptedPassphrase: bufferToBase64(k.webauthn.encryptedPassphrase),
            iv: bufferToBase64(k.webauthn.iv),
          }
        : undefined,
    }));

    const payload: NetworkVaultPayload = {
      format: 'openpgp-plugin-backup',
      version: 7,
      createdAt: new Date().toISOString(),
      keys: networkKeys,
    };

    return this.request<{ status: string }>('/api/vault', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 3. EPHEMERAL BRIDGE (RAM Store)
  // ==========================================

  public async createBridgeSecret(encryptedData: string, ttlSeconds: number = 300): Promise<BridgeSecretCreated> {
    return this.request<BridgeSecretCreated>('/api/bridge/secret', {
      method: 'POST',
      body: JSON.stringify({ encryptedData, ttlSeconds }),
    });
  }

  public async getBridgeSecret(id: string): Promise<BridgeSecretRetrieved> {
    // Note: Burn After Reading - une fois récupéré, le secret n'existe plus sur le serveur.
    return this.request<BridgeSecretRetrieved>(`/api/bridge/secret/${id}`, {
      method: 'GET',
    });
  }
}

export const aurionApi = new AurionAPI('https://api.aurion.dev');