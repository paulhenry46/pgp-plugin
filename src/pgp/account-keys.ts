import host from '@plugin-host';
import { listKeyRecords, saveKeyRecord } from '../storage.ts';
import { keyRecordEmails } from './key-utils.ts';

/**
 * Bulwark derives an account id from the JMAP username and the server URL:
 * a mail server moving to another URL (or a username change) gives the same
 * mailbox a new id, and its keys stay bound to the old one (no default key,
 * "Failed to get required keys for email sending."). Keys bound to an account
 * that no longer exists move to the existing account whose address is one of
 * their User IDs. A moved key does not take the default role from a key the
 * account already has.
 */
export async function adoptOrphanKeyRecords(): Promise<number> {
  const accounts = await host.user.getAccounts();
  if (!accounts.length) return 0;
  const known = new Set(accounts.map((a) => a.id));
  const records = await listKeyRecords();
  let adopted = 0;

  for (const rec of records) {
    if (!rec.accountId || known.has(rec.accountId)) continue;
    const emails = await keyRecordEmails(rec);
    const account = accounts.find((a) => a.email && emails.includes(a.email.toLowerCase()));
    if (!account) continue;

    const hasDefault = records.some((r) => r.accountId === account.id && r.default === true);
    await saveKeyRecord({ ...rec, accountId: account.id, ...(hasDefault ? { default: false } : {}) });
    rec.accountId = account.id;
    if (hasDefault) rec.default = false;
    adopted++;
  }

  if (adopted > 0) host.log.info(`Moved ${adopted} key(s) from a removed account to the current one.`);
  return adopted;
}
