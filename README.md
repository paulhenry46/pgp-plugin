# S/MIME plugin

End-to-end S/MIME (CMS / PKCS#7) for Bulwark Webmail, implemented as a
**privileged** (same-origin) plugin. All cryptography runs locally in the
browser using a bundled `pkijs` / `asn1js` / `webcrypto-liner` stack — no key
material ever leaves the device.

## What it does

| Capability | How |
|---|---|
| **Sign** outgoing mail | `onComposeSend` builds the MIME, wraps it in opaque CMS `SignedData`, and submits via `api.jmap.sendRaw`. |
| **Encrypt** outgoing mail | `onComposeSend` builds CMS `EnvelopedData` to every recipient (AES-256-GCM by default; AES-128 optional) plus the sender, then submits raw. Sign + Encrypt does proper sign-then-encrypt. |
| **Verify** incoming signatures | `onRenderEmailBody` fetches the CMS blob (`api.jmap.fetchBlob`), validates the signature cryptographically, checks validity dates, flags self-signed signers and signer≠From mismatches, and renders the inner body. |
| **Decrypt** incoming mail | `onRenderEmailBody` decrypts `EnvelopedData` with your unlocked key (RSA-OAEP, with an RSAES-PKCS1-v1_5 + 3DES/RC2 legacy fallback for old Outlook/Thunderbird mail). |
| **Key management** | `settings-section` slot: import PKCS#12 (`.p12`/`.pfx`), unlock/lock, delete, import recipient certificates, set sign/encrypt defaults. |
| **Status** | `email-banner` slot shows signature / encryption state; `composer-toolbar` slot has per-message Sign / Encrypt toggles. |

## Security model

- **Privileged tier.** Declares `tier: "privileged"` + `crypto:full`. Per
  `resolvePluginTier`, the same-origin tier is only granted to a **signed,
  admin-approved (managed)** bundle after high-risk consent. A self-uploaded
  copy is refused, not downgraded — sign and ship it through the admin channel.
- **Keys at rest.** Private keys are imported from PKCS#12 and re-wrapped with
  AES-256-GCM under a PBKDF2(SHA-256, 600 000) key derived from a passphrase
  you choose. Stored in IndexedDB; the raw key bytes are never persisted.
- **Keys in use.** Unlocking imports the key as a **non-extractable**
  `CryptoKey`. Because the background (hooks) iframe and the visible slot
  iframes are same-origin, the unlocked handle is shared through a session
  IndexedDB store — it stays non-extractable and is **wiped on app boot and on
  logout / account switch** (configurable), mirroring the former native
  "in-memory, cleared on reload" behaviour.
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
