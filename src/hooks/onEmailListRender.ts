import { STATE_PREFIX, VERIFY_PREFIX } from "../shared.ts";
import host from '@plugin-host';

export interface EmailListBadge {
  /** Stable unique key within the plugin - used as React key */
  key: string;
  /** Short label text displayed in the badge */
  label: string;
  /** CSS color value for the badge background, e.g. "#e74c3c" or "var(--color-warning)" */
  color?: string;
  /** Tooltip / aria-label */
  title?: string;
}

interface Context{ 
    emailId: string; 
    email: EmailReadView 
}
export interface EmailReadView {
  id: string;
  threadId: string;
  mailboxIds: string[];
  from: { name: string; email: string }[];
  to: { name: string; email: string }[];
  cc: { name: string; email: string }[];
  subject: string;
  receivedAt: string;
  isRead: boolean;
  isFlagged: boolean;
  hasAttachment: boolean;
  preview: string;
  keywords: string[];
  /** Full plain-text body of the message (HTML-only bodies are stripped to
   *  text). Empty string when the host hasn't loaded the body. Same
   *  `email:read` sensitivity as the rest of this view. */
  text: string;
  /**
   * Raw parsed header map (header name → value, or values when a header
   * appears more than once), exactly as JMAP returned it. Absent until the
   * host has loaded the message's headers. Same `email:read` sensitivity as
   * the rest of this view.
   */
  headers?: Record<string, string | string[]>;
  /**
   * Full, human-readable message source — headers, metadata and body — the
   * same text the "View source" dialog shows. Empty string when the body
   * hasn't been fetched. Gated by `email:read` like the rest of this view.
   */
  source: string;
  /**
   * Parsed Authentication-Results header (SPF, DKIM, DMARC, reverse-DNS).
   * Absent on stores that didn't parse the header (e.g. bodies not yet
   * fetched). Mirrors the structured shape exposed by the host.
   */
  auth?: {
    spf?: { result: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none' | 'temperror' | 'permerror'; domain?: string };
    dkim?: { result: 'pass' | 'fail' | 'policy' | 'neutral' | 'temperror' | 'permerror'; domain?: string; selector?: string };
    dmarc?: { result: 'pass' | 'fail' | 'none'; policy?: 'reject' | 'quarantine' | 'none'; domain?: string };
    iprev?: { result: 'pass' | 'fail'; ip?: string };
  };
}


export async function onEmailListItemRender(list: EmailListBadge[], context: Context): Promise<EmailListBadge[]> {
  console.log('onEmailListItemRender called for emailId:', context.emailId);
  const status = await getEmailListStatus(context.emailId);
    if (status && status.isEncrypted){
      list.push({
        key: 'pgp-encrypted',
        label: 'Encrypted',
        color: 'var(--color-success)',
        title: 'This email is encrypted with PGP.',
      });
      console.log(list);
      return list;
    }else{
      console.log(list);
      return list;
    }
}

async function getEmailListStatus(emailId: string): Promise<any> {
  if (!emailId) return;
 return await host.storage.get(STATE_PREFIX + emailId); 
}