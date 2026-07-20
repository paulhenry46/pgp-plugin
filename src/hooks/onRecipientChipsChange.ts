import { recipientKeysFor } from '../pgp/key-utils.ts';
import { settings} from '../shared.ts';
import {importOpenPgpPublicKey} from '../pgp/import.ts';
import { lookup } from '../pgp/server.ts';
import { getRecipient, saveRecipient } from '../storage.ts';

const ICON_MAP = {
  'lock': 'Lock',
  'triangle-alert': 'TriangleAlert',
  'ellipsis': 'Ellipsis',
};
type IconName = keyof typeof ICON_MAP;

export type Recipient = {
  name?: string;
  email: string;
  group?: { members: Array<{ name?: string; email: string }> };
  extra?: {
    color?: string; // optional color for display purposes. May be populated by plugins via the onRecipientChipsChange hook.
    icon?: IconName; // optional icon for display purposes. May be populated by plugins via the onRecipientChipsChange hook.
  };
};

export async function onRecipientChipsChange(chips: Recipient[]): Promise<Recipient[]> {
    const emails = chips.map(chip => chip.email);
    const { missing } = await recipientKeysFor(emails);

    // Track missing emails in a Set to handle dynamic updates cleanly
    const missingEmails = new Set(missing);

    if (settings().tryToFetchMissingKeys) {
        for (const email of missing) {
            if (!(await getRecipient(email))) {
                const { armored } = await lookup(email);
                if (armored) {
                    await importOpenPgpPublicKey(armored);
                    missingEmails.delete(email); // Successfully found key, no longer missing
                } else {
                    await saveRecipient({ email: email, hasNotPublicKey: true });
                }
            }
        }
    }

    // Return updated chips with lock icon and success color if they have a valid key
    return chips.map(chip => {
        if (!missingEmails.has(chip.email)) {
            return {
                ...chip,
                extra: {
                    ...chip.extra,
                    icon: 'lock',
                    color: 'success',
                },
            };
        }
        return chip;
    });
}