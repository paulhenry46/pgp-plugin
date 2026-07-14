# PGP True E2E plugin

End-to-end PGP for Bulwark Webmail, implemented as a
**privileged** (same-origin) plugin. All cryptography runs locally in the
browser — no key material ever leaves the device.

## Main Features

- **Core Cryptography** — Seamlessly encrypt, decrypt, sign, and verify emails locally using OpenPGP engine.
- **Zero-Disk Session Security (100% RAM)** — Unlike traditional plugins that temporarily write unlocked secret keys to shared browser storage (like IndexedDB), **PGP True E2E** isolates unlocked keys strictly within an in-memory Web Worker. Your decrypted keys never touch the disk, not even for a millisecond, ensuring instant destruction upon tab closure or crash.
- **True End-to-End Drafts & Attachments** — Standard PGP extensions only encrypt when you hit "Send", leaving your auto-saved drafts and attachments exposed to the server in cleartext while you write. This plugin intercepts the webmail's auto-save and upload cycles, encrypting drafts and attachments *locally in the browser* before they ever reach the network.
- **Encrypted-at-Rest Local Search Index** —  **PGP True E2E** securely decrypts and indexes your emails into a local, encrypted-at-rest database. Search your secure history instantly without leaking a single keyword to the server or writing decrypted text to the disk.
- **Automated Key Exchange** — Automatically detects and imports public keys attached to incoming signed emails, making recipient keyring management effortless (optional).
- **Keyserver Integration** — Seamlessly publish your public key to or fetch recipient keys from keys.openpgp.org directly within the interface.
- **WebAuthn** —  Don't want to type your passphrase every time you go to client ? Just use the webauthn feature. Unlock your keys with one click ! Your key need to support PRF.
- **Public Key Attachment** — There is an option to automatically send as an attachment the public key corresponding to your adress.
- **Import / Export** — You can import and exports the local search/preview index and your keys.
## Roadmap (=  not implemented yet, for future versions)
### 1.0.0
- implements rerenderEmailBody when unlocked + prompte to unlock if needed
### Future
 - check during emails writing if to,cc,bcc adresses have pubkey and show badge next to them if yes or not
 - if some adresses doesnt have key, propmt for confirmation before sending 2 mails whith same messageID : one encrypted to on those who have public key and not encrptyed to thoses who doesnet' have
 - integration of public keys in the contact part of the app
 - badge next to the email in row to see if it is encrypted E2E or encrypted by Server (add new hook and edit stalwart server)
 - when starting the app and decrypting the keys, automatically fetch the localstorage index without reload need. (new plugin need, like the rerenderEmailBody)


## Security model

- **Privileged tier.** Declares `tier: "privileged"` + `crypto:full`. Per
  `resolvePluginTier`, the same-origin tier is only granted to a **signed,
  admin-approved (managed)** bundle after high-risk consent. A self-uploaded
  copy is refused, not downgraded — sign and ship it through the admin channel.
- **Keys at rest.** Private keys are re-wrapped with
  AES-256-GCM under a PBKDF2(SHA-256, 600 000) key derived from a passphrase
  you choose. Stored in IndexedDB; the raw key bytes are never persisted.
- **Keys in use.** Unlocking store the key in RAM. There are NEVER persisted to IndexedDB or disk. How it works ? The background part of the plugin acts like a service worker. It communicates keys to other sandboxed plugin components. It means that if another plugin / something else can inject script in the client, he can steal your keys. But there is the same vulenaribilty if we store them in the indexedDB cleared when in use.
- Returned HTML still passes through the host sanitizer. 

## Build

```bash
cd repos/plugins/smime
npm install          # pulls pkijs / asn1js / pvtsutils / webcrypto-liner + esbuild
npm run build        # → dist/index.js  (~1.7 MB, under the privileged cap)
npm run package      # → openpgp.zip (manifest.json + index.js) for admin upload
```

## Dependencies
We use
- OpenPGP, of course
- mimetext to generate the mime message when encrypting


## Note on host wiring

The `onComposeSend` and `onRenderEmailBody` hook buses and the privileged
`api.jmap` surface exist in the host (see `lib/plugin-hooks.ts`,
`lib/plugin-sandbox/host-api.ts`). The send/render **takeover** fires once the
host emits those buses from the composer and viewer (the migration that retires
the inline native path). The `settings-section`, `composer-toolbar`, and
`email-banner` slots are active today.
