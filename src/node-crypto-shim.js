// Browser shim for the Node "crypto" builtin that webcrypto-liner's dependency
// (asmcrypto.js) references in a `typeof process !== 'undefined'` branch that
// never executes in a browser iframe. Provides a working randomBytes anyway so
// the bundle is correct even if that path is somehow reached.

export function randomBytes(n) {
  const b = new Uint8Array(n);
  (globalThis.crypto || globalThis.self?.crypto).getRandomValues(b);
  return b;
}

export default { randomBytes };
