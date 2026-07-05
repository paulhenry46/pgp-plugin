
declare module '@plugin-host' {
  export const storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
  };
  export const jmap: {
    fetchBlob(blobId: string, options?: { name?: string; type?: string }): Promise<Uint8Array>;
    sendRaw(blob: ArrayBuffer, identityId: string, options: { envelopeRecipients: string[] }): Promise<void>;
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
  };
  export const plugin: {
    settings?: {
      encryptionStrength?: 'aes-128' | 'aes-256';
      autoImportSignerCerts?: boolean;
      warnOnSelfSigned?: boolean;
      lockOnLogout?: boolean;
    };
  } | undefined;
}