import host from '@plugin-host';
export const PREFS_KEY = 'prefs.v1';
export const INTENT_KEY = 'composeIntent.v1';
export const VERIFY_PREFIX = 'verify:';
export const STATE_PREFIX = 'state.list:';

export function settings() {
  return host.plugin?.settings || {};
}