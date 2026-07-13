
declare module '@plugin-host' {
  export const i18n : any;
  export const storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
  };
  export const jmap: {
    fetchBlob(blobId: string, options?: { name?: string; type?: string }): Promise<Uint8Array>;
    sendRaw(blob: ArrayBuffer, identityId: string, options: { envelopeRecipients: string[] }): Promise<void>;
  };
  export const webauthn: {
    getOrCreatePRF(masterCredIdBytes?: number[], rpId?: string, userVisibleName?: string): Promise<{ credentialId: number[]; prfSecret: number[] }>;
  };
  export const upfiles: {
    get(fileId: string): Promise<File>;
    save(formerId: string, file: File): Promise<string>;
    
  };
  export const log: {
    info(msg: string, ...args: any[]): void;
    warn(msg: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
  };
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
  };
  export const plugin: {
    settings?: {
      autoImportSignerCerts?: boolean;
      defaultSign?: boolean;
      defaultEncrypt?: boolean;
      lockOnLogout?: boolean;
      encryptDrafts?: boolean;
      askForDefaultKeyPassOnActivated?: boolean;
      alwaysSendPubKey?: boolean;
    };
  } | undefined;
}