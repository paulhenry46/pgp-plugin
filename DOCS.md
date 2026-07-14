### User Documentation

#### Key Management
1. **Import Keys:** Click the import buttons to add your private and public keys.
2. **Publish Keys:** Easily publish your public key to the open keyserver by clicking the upload button.
3. **Search Keys:** Search for a recipient's public key by email address directly on the `keys.openpgp.org` keyserver.

#### Local Search Index & Default Key
To use the local search index feature, you must select a **default private key** by checking its designated checkbox. 
- **Encryption:** We use the passphrase of your default key combined with a unique salt to securely derive the encryption key for your local database.
- **Startup:** When you open the webmail client, you will be prompted to enter this default key's passphrase to unlock and load the search index.

> **Important Note on the Search Index:** Currently, an email is only added to the local search index **after it has been decrypted for the first time** by the plugin. Consequently, new incoming, unread emails cannot be searched or previewed immediately. 
> 
> If you migrate to a new machine and want to keep your search index, you can export all plugin data to a JSON file and import it into your new browser.
>
> **Search Behavior & Filters:** At present, the local search returns **all emails** matching your query, regardless of the active mailbox folder (e.g., Inbox vs. Archive) or any other applied UI filters. A more refined folder-specific filtering system is planned for future versions.

#### Draft & Attachment Encryption
Drafts are automatically encrypted using your **default key**, regardless of the sender address (`From`) selected in the composer. (Rest assured, when you actually send the email, the correct keys for your recipients are used).

**Attachment Anonymization:** Attachment metadata (filename and MIME type) is fully encrypted. The mail server only sees an obfuscated file name (e.g., `a4d5r-ahsbs-h5f1-s6v5i`) and a generic `application/octet-stream` MIME type, preventing any metadata leaks.

> **How is it encrypted? (Under the Hood)**
> Draft attachments actually use **Inline-PGP encryption**. Why? 
> 
> Imagine you upload a 20 MB attachment to your draft. If we used standard PGP/MIME, the entire attachment would have to be re-encrypted and uploaded to the mail server *every single time* the draft auto-saves. On a slower internet connection, this would freeze your composer for 20 seconds every few minutes—which is incredibly annoying.
> 
> By using Inline-PGP for drafts, the encrypted attachment is uploaded **only once**. You can then continue editing your email text smoothly without any lag. When you finally hit **Send**, the plugin automatically downloads and decrypts the attachment locally, then packages everything into a clean, standard PGP/MIME message for your recipient.

#### Sending Emails
You can choose to encrypt and/or sign your emails by clicking the dedicated buttons added to the composer toolbar. 
- **Validation:** If any recipient's email address lacks a valid public key, the sending process is automatically cancelled to prevent cleartext leaks.
- **Public Key Attachment:** You can enable an option to automatically attach your public key when sending encrypted emails.

#### WebAuthn (Passwordless Unlock)
If you prefer not to type your passphrase every time you open your webmail, you can use our WebAuthn feature. This requires a hardware security key (like a Yubikey) or a platform authenticator that supports the **WebAuthn PRF extension**.

1. **Linking your key:** In the plugin settings, click the key icon next to your key. Your hardware authenticator will generate a unique, local PRF secret. The plugin uses this secret to encrypt your key's passphrase. If you link multiple PGP keys, the same PRF secret is used to encrypt all their passphrases. This allows you to **unlock all your keys in a single hardware tap**.
2. **Decrypting:** If one or more keys are configured with WebAuthn, a **"Decrypt with WebAuthn"** button will appear in your settings. Simply click it and touch your security key.

---

> **Tip for Testers:**
> If you do not have a physical security key that supports the PRF extension, you can use Chrome's virtual authenticator (accessible in Developer Tools under *WebAuthn*). Just make sure to check the **Enable HMAC** options when creating the virtual authenticator.