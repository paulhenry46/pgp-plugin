import { VerifSignerCert } from "../index.tsx";
import host from '@plugin-host';
import React from 'react'
import { VERIFY_PREFIX } from '../shared.ts';
const h = React.createElement;
const { useState, useEffect } = React;

interface EmailHeaders {
  'Content-Type'?: string | string[];
  'content-type'?: string | string[];
  [key: string]: any;
}

interface EmailProps {
  email?: {
    id: string;
    headers?: EmailHeaders;
    [key: string]: any;
  };
}


interface VerificationStatus {
  isEncrypted?: boolean;
  isSigned?: boolean;
  decryptionSuccess?: boolean;
  decryptionError?: string;
  signerCert?: VerifSignerCert;
  signatureValid?: boolean;
  signerEmailMatch?: boolean;
  selfSigned?: boolean;
  signatureError?: string;
  unsupportedReason?: string;
  processing?: boolean;
}

// Type for the component's display rows
type Tone = 'ok' | 'warn' | 'error' | 'muted';
type BannerRow = [string, Tone];

export function EmailBanner(props: EmailProps) {
  const email = props && props.email;
  const emailId = email?.id;

  const [status, setStatus] = useState<VerificationStatus | null>({isEncrypted: false});

  useEffect(() => {
    let alive = true;
    let intervalId: number | null = null;

    const checkStorage = async () => {
       
      if (!emailId || !alive) return;

      // Query the host's real shared storage
      const s: VerificationStatus | null = await host.storage.get(VERIFY_PREFIX + emailId);
      
      if (!alive) return;

      // If storage contains data and we are not currently recalculating (processing)
      if (s && !s.processing) {
        setStatus(s);
        console.log('s',s);
        // Stop monitoring only if the result is stable
        if (s.decryptionSuccess || (s.decryptionError && s.decryptionError !== 'locked') || s.signatureValid) {
          if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } else {
        // Visual fallback based on headers while storage is empty or still processing
        const ct = email?.headers && (email.headers['Content-Type'] || email.headers['content-type']);
        const ctStr = Array.isArray(ct) ? ct[0] : (ct as string | undefined);
        
        let fallback: VerificationStatus | null = null;
        if (ctStr && ctStr.includes('multipart/encrypted')) {
          fallback = { isEncrypted: true };
        } else if (ctStr && ctStr.includes('multipart/signed')) {
          fallback = { isSigned: true };
        }
        setStatus(fallback);
      }
    };

    // Start verification immediately on mount
    checkStorage();
    
    // Poll the RPC storage every 300ms
    intervalId = window.setInterval(checkStorage, 300);

    return () => {
      alive = false;
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [emailId]);

  if (!emailId || !status) return null;

  const rows: BannerRow[] = [];
 
  if (status.isEncrypted) {
    if (status.decryptionSuccess) rows.push([ 'Decrypted via OpenPGP', 'ok']);
    else if (status.decryptionError === 'locked') rows.push([ 'Encrypted — unlock your PGP key to read', 'warn']);
    else if (status.decryptionError) rows.push([ `Encrypted — ${status.decryptionError}`, 'error']);
    else if (status.decryptionError !== null) rows.push([ 'PGP : Processing', 'muted']);
  }
  
  if (status.isSigned || status.signerCert) {
    if (status.signatureValid) {
      const who = status.signerCert && status.signerCert.email ? ` by ${status.signerCert.email}` : '';
      const mismatch = status.signerEmailMatch === false ? ' ⚠ signer ≠ From' : '';
      const ss =  status.selfSigned ? ' (self-signed key)' : '';
      rows.push([ `PGP Signature valid${who}${ss}${mismatch}`, status.signerEmailMatch === false ? 'warn' : 'ok']);
    } else if (status.signatureError) {
      rows.push([ `PGP Signature invalid: ${status.signatureError}`, 'error']);
    } else {
      rows.push([ 'Signed OpenPGP message', 'muted']);
    }
  }

  if (rows.length === 0) return null;

  const toneColor = (tone: Tone): string => 
    tone === 'ok' ? 'var(--color-success, #16a34a)'
    : tone === 'error' ? 'var(--color-destructive, #dc2626)'
      : tone === 'warn' ? 'var(--color-warning, #d97706)'
        : 'var(--color-muted-foreground, #64748b)';

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
    rows.map(([ text, tone], i) =>
      h('div', {
        key: i,
        style: {
          display: 'flex', gap: '8px', alignItems: 'center',
          padding: '6px 10px', fontSize: '13px',
          border: `1px solid ${toneColor(tone)}`,
          color: toneColor(tone),
        },
      },  h('span', null, text)),
    ),
  );
}

export function EmailSecuBanner(props: EmailProps) {
  const email = props && props.email;
  const emailId = email?.id;

  const [status, setStatus] = useState<VerificationStatus | null>({isEncrypted: false});

  useEffect(() => {
    let alive = true;
    let intervalId: number | null = null;

    const checkStorage = async () => {
      if (!emailId || !alive) return;

      const s: VerificationStatus | null = await host.storage.get(VERIFY_PREFIX + emailId);
      
      if (!alive) return;
      if (s && !s.processing) {
        setStatus(s);
        console.log('s', s);
        if (s.decryptionSuccess || (s.decryptionError && s.decryptionError !== 'locked') || s.signatureValid) {
          if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } else {
        const ct = email?.headers && (email.headers['Content-Type'] || email.headers['content-type']);
        const ctStr = Array.isArray(ct) ? ct[0] : (ct as string | undefined);
        
        let fallback: VerificationStatus | null = null;
        if (ctStr && ctStr.includes('multipart/encrypted')) {
          fallback = { isEncrypted: true };
        } else if (ctStr && ctStr.includes('multipart/signed')) {
          fallback = { isSigned: true };
        }
        setStatus(fallback);
      }
    };

    checkStorage();
    intervalId = window.setInterval(checkStorage, 300);

    return () => {
      alive = false;
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [emailId]);

  if (!emailId || !status) return null;



  const isEncrypted = !!status.isEncrypted;
  const isSigned = !!(status.isSigned || status.signerCert);
  const hasSignatureError = !!status.signatureError;

  // If the message is neither encrypted nor signed, render nothing
  if (!isEncrypted && !isSigned) return null;

  // Define the required SVGs
  const svgEncrypted = h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '24px', viewBox: '0 -960 960 960', width: '24px', fill: 'currentColor', style: { width: '16px', height: '16px' } }, 
    h('path', { d: 'M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z' })
  );

  const svgSigned = h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '24px', viewBox: '0 -960 960 960', width: '24px', fill: 'currentColor', style: { width: '16px', height: '16px' } }, 
    h('path', { d: 'm438-452-58-57q-11-11-27.5-11T324-508q-11 11-11 28t11 28l86 86q12 12 28 12t28-12l170-170q12-12 11.5-28T636-592q-12-12-28.5-12.5T579-593L438-452ZM326-90l-58-98-110-24q-15-3-24-15.5t-7-27.5l11-113-75-86q-10-11-10-26t10-26l75-86-11-113q-2-15 7-27.5t24-15.5l110-24 58-98q8-13 22-17.5t28 1.5l104 44 104-44q14-6 28-1.5t22 17.5l58 98 110 24q15 3 24 15.5t7 27.5l-11 113 75 86q10 11 10 26t-10 26l-75 86 11 113q2 15-7 27.5T802-212l-110 24-58 98q-8 13-22 17.5T584-74l-104-44-104 44q-14 6-28 1.5T326-90Zm52-72 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Z' })
  );

  const svgError = h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '24px', viewBox: '0 -960 960 960', width: '24px', fill: 'currentColor', style: { width: '16px', height: '16px' } }, 
    h('path', { d: 'M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5Zm0-160Q520-463 520-480v-160q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640v160q0 17 11.5 28.5T480-440q17 0 28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z' })
  );

  // Determine the label and color based on the overall verdict
  let label = '';
  let color = 'var(--color-foreground, #64748b)'; // Default
  let bgcolor = 'var(--color-muted, rgba(100,116,139,0.06))'; // Default
  const icons: any[] = [];

  if (isEncrypted && isSigned) {
    label = 'Encrypted and signed';
    color = hasSignatureError ? 'var(--color-destructive, #dc2626)' : '#00c950';
    bgcolor = hasSignatureError ? '#fb2c36' : '#00c950';
    icons.push(svgEncrypted, hasSignatureError ? svgError : svgSigned);
  } else if (isEncrypted) {
    label = 'Encrypted';
    color = 'var(--color-success, #16a34a)';
    bgcolor = '#00c950';
    icons.push(svgEncrypted);
  } else if (isSigned) {
    label = 'Signed';
    color = hasSignatureError ? 'var(--color-destructive, #dc2626)' : '#00c950';
    bgcolor = hasSignatureError ? '#fb2c36' : '#00c950';
    icons.push(hasSignatureError ? svgError : svgSigned);
  }


  return h('div', { style: { display: 'flex', gap: '6px', padding: '6px 0' } },
  h('span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        'padding-left': '0.5rem',
        'padding-right': '0.5rem',
        'padding-top': '0.25rem',
        'padding-bottom': '0.25rem',
        'border-radius': '0.375rem',
        'border-width': '1px',
        'font-size': '0.75rem',
        'line-height': '1rem',
        'background-color': `color-mix(in oklab, ${bgcolor} 7.0%, transparent)`,
        'border-color': color,
        'border-style': 'solid',
      }
    },
    h('span',
      {
        style: {
          'color': color,
          'display': 'inline-flex', 
        }
      },
      // Loop over the icons to apply margin-left only to the second one
      icons.map((icon, index) => {
        if (index === 1) {

          return h('span', { key: index, style: { 'margin-left': '0.25rem', 'display': 'inline-flex' } }, icon);
        }
        return icon;
      })
    ),
    label
  )
);
}