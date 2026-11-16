/**
 * The address a public key may be saved under when it was obtained for a
 * given address (the sender of a message, or the address that was looked up):
 * that address itself, and only when one of the key's User IDs carries it.
 * Returns null otherwise, so a key can never be filed under an address its
 * holder chose freely.
 */
export function keyAddressFor(keyEmails: string[], expected: string): string | null {
  const want = String(expected || '').trim().toLowerCase();
  if (!want) return null;
  return keyEmails.some((e) => String(e || '').trim().toLowerCase() === want) ? want : null;
}
