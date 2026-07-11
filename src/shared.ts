import host from '@plugin-host';
export const PREFS_KEY = 'prefs.v1';
export const INTENT_KEY = 'composeIntent.v1';
export const VERIFY_PREFIX = 'verify:';
export const STATE_PREFIX = 'state.list:';
export const KDF_ITERATIONS = 600_000;
export const AES_KEY_LENGTH = 256;

export function settings() {
  return host.plugin?.settings || {};
}