import host from '@plugin-host';
export const PREFS_KEY = 'prefs.v1';
export const INTENT_KEY = 'composeIntent.v1';
export const VERIFY_PREFIX = 'verify:';

export function settings() {
  return host.plugin?.settings || {};
}