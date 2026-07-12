# PGP plugin

End-to-end PGP for Bulwark Webmail, implemented as a
**privileged** (same-origin) plugin. All cryptography runs locally in the
browser — no key material ever leaves the device.

It use the MIME/S plugin as foundation.

## Main Features

- **Core Cryptography** — Seamlessly encrypt, decrypt, sign, and verify emails locally using OpenPGP engine.
- **Zero-Disk Session Security (100% RAM)** — Unlike traditional plugins that temporarily write unlocked secret keys to shared browser storage (like IndexedDB), **PGP True E2E** isolates unlocked keys strictly within an in-memory Web Worker. Your decrypted keys never touch the disk, not even for a millisecond, ensuring instant destruction upon tab closure or crash.
- **True End-to-End Drafts & Attachments** — Standard PGP extensions only encrypt when you hit "Send", leaving your auto-saved drafts and attachments exposed to the server in cleartext while you write. This plugin intercepts the webmail's auto-save and upload cycles, encrypting drafts and attachments *locally in the browser* before they ever reach the network.
- **Encrypted-at-Rest Local Search Index** —  **PGP True E2E** securely decrypts and indexes your emails into a local, encrypted-at-rest database. Search your secure history instantly without leaking a single keyword to the server or writing decrypted text to the disk.
- **Automated Key Exchange** — Automatically detects and imports public keys attached to incoming signed emails, making recipient keyring management effortless.
- **Keyserver Integration** — Seamlessly publish your public key to or fetch recipient keys from keys.openpgp.org directly within the interface.


## Security model

- **Privileged tier.** Declares `tier: "privileged"` + `crypto:full`. Per
  `resolvePluginTier`, the same-origin tier is only granted to a **signed,
  admin-approved (managed)** bundle after high-risk consent. A self-uploaded
  copy is refused, not downgraded — sign and ship it through the admin channel.
- **Keys at rest.** Private keys are imported from PKCS#12 and re-wrapped with
  AES-256-GCM under a PBKDF2(SHA-256, 600 000) key derived from a passphrase
  you choose. Stored in IndexedDB; the raw key bytes are never persisted.
- **Keys in use.** Unlocking store the key in RAM. There are NEVER persisted to IndexedDB or disk.
- Returned HTML still passes through the host sanitizer.

## Build

```bash
cd repos/plugins/smime
npm install          # pulls pkijs / asn1js / pvtsutils / webcrypto-liner + esbuild
npm run build        # → dist/index.js  (~1.7 MB, under the privileged cap)
npm run package      # → smime.zip (manifest.json + index.js) for admin upload
```

The build aliases the Node `crypto` builtin (referenced by a dead
`typeof process` branch in `asmcrypto.js`) to a browser shim so the bundle is
self-contained.

## Layout

```
src/
  index.js            entry: activate + hooks + slots (React.createElement UI)
  crypto-engine.js    pkijs CryptoEngine w/ 3DES/RC2 + legacy PKCS#12 PBE
  certificate-utils.js X.509 parse + metadata + capability classification
  mime-builder.js     deterministic CRLF MIME builder + CMS RFC822 wrapper
  mime-parse.js       inner-MIME parser for decrypted/verified content
  smime-detect.js     detect CMS from Content-Type / bodyStructure / attachments
  smime-sign.js       CMS SignedData (opaque)
  smime-encrypt.js    CMS EnvelopedData
  smime-decrypt.js    CMS decrypt + blob normalisation + recipient matching
  smime-verify.js     CMS signature verification + signer status
  pkcs12.js           PKCS#12 import + key wrap/unlock
  key-storage.js      IndexedDB: key records, recipient certs, session keys
  util.js             uuid / hex / equality helpers
  node-crypto-shim.js browser shim for the Node "crypto" builtin
```

The crypto modules are faithful ports of the host's `lib/smime/*` (the former
native pipeline), so the plugin produces byte-compatible CMS.

## Note on host wiring

The `onComposeSend` and `onRenderEmailBody` hook buses and the privileged
`api.jmap` surface exist in the host (see `lib/plugin-hooks.ts`,
`lib/plugin-sandbox/host-api.ts`). The send/render **takeover** fires once the
host emits those buses from the composer and viewer (the migration that retires
the inline native path). The `settings-section`, `composer-toolbar`, and
`email-banner` slots are active today.
