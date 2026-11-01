
declare module '@plugin-host' {
  export const i18n : any;
  export const storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
  };
  export const jmap: {
    fetchBlob(blobId: string, options?: { name?: string; type?: string, rangeHeader?: number }): Promise<Uint8Array>;
    uploadBlob(blob: Uint8Array, name: string, type: string): Promise<{ blobId: string; size: number; type: string; }>;
    sendRaw(blob: ArrayBuffer, identityId: string, options: { envelopeRecipients: string[] }): Promise<void>;
    submitRaw(blob: ArrayBuffer, identityId: string, options?: { envelopeRecipients: string[] }): Promise<void>;
    importRaw(blob: ArrayBuffer, mailboxRoles: string[], options?: { identityId: string; envelopeRecipients: string[] }): Promise<void>;
  };
  export const crypto: {
      getPublicKeys() : Promise<PublicKeyInfo[]>;
      createPublicKey(input: PublicKeyInput): Promise<string>;//id of key
      removePublicKey(keyId: string): Promise<void>;
      setEncryptionAtRest(config: EncryptionAtRestConfig): Promise<void>;
      getEncryptionAtRest(): Promise<EncryptionAtRestConfig>;
      getPublicKeyFromWKD(email: string): Promise<WkdResult>;
      getWebAuthn(masterCredentialIdBytes: number[]): Promise<{credentialId: number[]; prfSecret: number[]}>;
      createWebAuthn(name: string, displayName: string):  Promise<{ success: true; credentialId: number[]; prfSecret: number[] } | { success: false; reason: 'NEEDS_USER_ACTION'; credentialId: number[], prfSecret?: number[] } | { success: false; reason: string; credentialId?: number[], prfSecret?: number[] }>;
      //getOrCreateWebAuthn(masterCredIdBytes?: number[], rpId?: string, userVisibleName?: string): Promise<{ credentialId: number[]; prfSecret: number[] }>;
    },
  export const upfiles: {
    get(fileId: string): Promise<File>;
    save(formerId: string, file: File): Promise<string>;
    
  };
  export const admin:{
    getConfig(value?: string): Promise<any>;
  },
  export const http: {
    post(path: string, body: Record<string, unknown> | Blob, options?: { headers?: Record<string, string> }) : Promise<{ ok: boolean; status: number; data: unknown }>;
    fetch(url: string, init?: unknown):Promise<Any>;
  }
  export const user: {
    getAccounts(): Promise<AccountEntry[]>;
    getIdentities(): Promise<Identity[]>;
  }
  export const log: {
    info(msg: string, ...args: any[]): void;
    warn(msg: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
  };
  export const contacts: {
      get(contactId: string): Promise<ContactCard>;
      update(contactId: string, updates: Partial<ContactCard>): Promise<void>;
      create(contact: ContactCard): Promise<string>;
      search(query: string): Promise<ContactCard[]>;
    },

  export const toast: {
    success(msg: string): void;
    error(msg: string): void;
    info(msg: string): void;
  };
  export const ui: {
    confirm(options: { title: string; message: string; danger?: boolean; confirmLabel?: string }): Promise<boolean>;
    prompt(opts: {
        title?: string;
        message?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        fields?: Array<{ name: string; label: string; type?: 'text' | 'password'; placeholder?: string; required?: boolean }>;
      }): Promise<Record<string, string> | null>;
      downloadFile: (opts: { content: string; filename: string; contentType?: string }) => Promise<void>;
      rerenderEmail(): void;
      rerenderFetchedEmails(): void;
  };
  export const plugin: {
    settings?: {
      autoImportSignerCerts?: boolean;
      defaultSign?: boolean;
      defaultEncrypt?: boolean;
      lockOnLogout?: boolean;
      removeOnLogout?: boolean;
      encryptDrafts?: boolean;
      askForDefaultKeyPassOnActivated?: "default" | "all" | "false";
      alwaysSendPubKey?: boolean;
      tryToFetchMissingKeys?: boolean;
      StoreDangerous?: boolean;
      generateKey?: 'curve25519' | 'ed25519Legacy' | 'rsa4096';
    };
  } | undefined;
}