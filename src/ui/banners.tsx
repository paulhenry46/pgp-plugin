import host from '@plugin-host';
import React from 'react'
import { VERIFY_PREFIX } from '../shared.ts';
const h = React.createElement;
const { useState, useEffect } = React;

 interface VerifSignerCert {
id: string;
email: string;
fingerprint: string;
}

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

type Tone = 'ok' | 'warn' | 'error' | 'muted';
type BannerRow = [string, Tone];

// Assure-toi d'importer `h` (depuis Preact ou ton framework) selon ton environnement.

export function EmailBanner(props: EmailProps) {
  const email = props && props.email;
  const emailId = email?.id;

  const [status, setStatus] = useState<VerificationStatus | null>({ isEncrypted: false });

  useEffect(() => {
    let alive = true;
    let intervalId: number | null = null;

    const checkStorage = async () => {
      if (!emailId || !alive) return;

      const s: VerificationStatus | null = await host.storage.get(VERIFY_PREFIX + emailId);
      
      if (!alive) return;

      if (s && !s.processing) {
        setStatus(s);
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

  // On enrichit la structure de chaque ligne avec un label et une icône
  const rows: { labelText: string; fromText: string; tone: Tone; icon: string }[] = [];
 
  if (status.isEncrypted) {
    const labelText = host.i18n.t('banner.encrypted_label') || 'Chiffrement';
    
    if (status.decryptionSuccess) {
      rows.push({ labelText, fromText: host.i18n.t('banner.decrypted_success'), tone: 'ok', icon: 'lock' });
    } else if (status.decryptionError === 'locked') {
      rows.push({ labelText, fromText: host.i18n.t('banner.encrypted_locked'), tone: 'warn', icon: 'lock' });
    } else if (status.decryptionError) {
      rows.push({ labelText: 'Erreur', fromText: `${host.i18n.t('banner.encrypted_prefix')}${status.decryptionError}`, tone: 'error', icon: 'alert' });
    } else if (status.decryptionError !== null) {
      rows.push({ labelText, fromText: host.i18n.t('banner.processing'), tone: 'muted', icon: 'clock' });
    }
  }
  
  if (status.isSigned || status.signerCert) {
    const labelText = host.i18n.t('banner.sig_label') || 'Signature';

    if (status.signatureValid) {
      const who = status.signerCert && status.signerCert.email ? `${host.i18n.t('banner.sig_by')}${status.signerCert.email}` : '';
      const mismatch = status.signerEmailMatch === false ? host.i18n.t('banner.sig_mismatch') : '';
      const ss =  status.selfSigned ? host.i18n.t('banner.sig_self_signed') : '';
      
      const tone = status.signerEmailMatch === false ? 'warn' : 'ok';
      rows.push({ labelText, fromText: `${host.i18n.t('banner.sig_valid')}${who}${ss}${mismatch}`, tone, icon: 'shield-check' });
    } else if (status.signatureError) {
      rows.push({ labelText: 'Signature Invalide', fromText: `${host.i18n.t('banner.sig_invalid_prefix')}${status.signatureError}`, tone: 'error', icon: 'shield-alert' });
    } else {
      rows.push({ labelText, fromText: host.i18n.t('banner.sig_unsigned_fallback'), tone: 'muted', icon: 'shield' });
    }
  }

  if (rows.length === 0) return null;

  const getThemeVars = (tone: Tone) => {
    const baseColor = tone === 'ok' ? 'var(--color-success, #16a34a)'
      : tone === 'error' ? 'var(--color-destructive, #dc2626)'
      : tone === 'warn' ? 'var(--color-warning, #d97706)'
      : 'var(--color-muted-foreground, #64748b)';
    
    return {
      color: baseColor,
      bg: `color-mix(in srgb, ${baseColor} 12%, transparent)`,
      border: `1px solid color-mix(in srgb, ${baseColor} 25%, transparent)`,
      iconBg: `color-mix(in srgb, ${baseColor} 25%, transparent)`,
    };
  };

  const renderIcon = (icon: string) => {
    const svgProps = {
      viewBox: '0 0 24 24', width: '20', height: '20',
      fill: 'none', stroke: 'currentColor', strokeWidth: '2',
      strokeLinecap: 'round', strokeLinejoin: 'round'
    };

    if (icon === 'lock') {
      return h('svg', svgProps, [
        h('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2', key: '1' }),
        h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4', key: '2' })
      ]);
    }
    if (icon === 'shield-check') {
      return h('svg', svgProps, [
        h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', key: '1' }),
        h('path', { d: 'M9 12l2 2 4-4', key: '2' })
      ]);
    }
    if (icon === 'shield-alert') {
      return h('svg', svgProps, [
        h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', key: '1' }),
        h('line', { x1: '12', y1: '8', x2: '12', y2: '12', key: '2' }),
        h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16', key: '3' })
      ]);
    }
    if (icon === 'alert') {
      return h('svg', svgProps, [
        h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', key: '1' }),
        h('line', { x1: '12', y1: '9', x2: '12', y2: '13', key: '2' }),
        h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17', key: '3' })
      ]);
    }
    // Default (clock / processing)
    return h('svg', svgProps, [
      h('circle', { cx: '12', cy: '12', r: '10', key: '1' }),
      h('polyline', { points: '12 6 12 12 16 14', key: '2' })
    ]);
  };

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
    rows.map(({ labelText, fromText, tone, icon }, i) => {
      const theme = getThemeVars(tone);

      return h('div', {
        key: i,
        role: 'note',
        title: fromText,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 24px',
          background: theme.bg,
          borderBottom: theme.border,
          color: 'var(--color-foreground)',
        },
      },
        h('div', {
          style: {
            width: '40px', height: '40px', borderRadius: '9999px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            background: theme.iconBg,
            color: theme.color,
          },
          'aria-hidden': 'true',
        },
          renderIcon(icon)
        ),
        h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' } },
          h('div', {
            style: {
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.75,
              color: theme.color,
            },
          }, labelText),
          fromText ? h('div', { style: { fontSize: '14px', fontWeight: 600, lineHeight: 1.4 } }, fromText) : null
        )
      );
    })
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

  if (!isEncrypted && !isSigned) return null;

  const svgEncrypted = h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '24px', viewBox: '0 -960 960 960', width: '24px', fill: 'currentColor', style: { width: '16px', height: '16px' } }, 
    h('path', { d: 'M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z' })
  );

  const svgSigned = h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '24px', viewBox: '0 -960 960 960', width: '24px', fill: 'currentColor', style: { width: '16px', height: '16px' } }, 
    h('path', { d: 'm438-452-58-57q-11-11-27.5-11T324-508q-11 11-11 28t11 28l86 86q12 12 28 12t28-12l170-170q12-12 11.5-28T636-592q-12-12-28.5-12.5T579-593L438-452ZM326-90l-58-98-110-24q-15-3-24-15.5t-7-27.5l11-113-75-86q-10-11-10-26t10-26l75-86-11-113q-2-15 7-27.5t24-15.5l110-24 58-98q8-13 22-17.5t28 1.5l104 44 104-44q14-6 28-1.5t22 17.5l58 98 110 24q15 3 24 15.5t7 27.5l-11 113 75 86q10 11 10 26t-10 26l-75 86 11 113q2 15-7 27.5T802-212l-110 24-58 98q-8 13-22 17.5T584-74l-104-44-104 44q-14 6-28 1.5T326-90Zm52-72 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Z' })
  );

  const svgError = h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '24px', viewBox: '0 -960 960 960', width: '24px', fill: 'currentColor', style: { width: '16px', height: '16px' } }, 
    h('path', { d: 'M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5Zm0-160Q520-463 520-480v-160q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640v160q0 17 11.5 28.5T480-440q17 0 28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z' })
  );

  let label = '';
  let color = 'var(--color-foreground, #64748b)'; 
  let bgcolor = 'var(--color-muted, rgba(100,116,139,0.06))'; 
  const icons: any[] = [];

  if (isEncrypted && isSigned) {
    label = host.i18n.t('banner.secu.encrypted_signed');
    color = hasSignatureError ? 'var(--color-destructive, #dc2626)' : '#00c950';
    bgcolor = hasSignatureError ? '#fb2c36' : '#00c950';
    icons.push(svgEncrypted, hasSignatureError ? svgError : svgSigned);
  } else if (isEncrypted) {
    label = host.i18n.t('banner.secu.encrypted');
    color = 'var(--color-success, #16a34a)';
    bgcolor = '#00c950';
    icons.push(svgEncrypted);
  } else if (isSigned) {
    label = host.i18n.t('banner.secu.signed');
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
          'border-color': 'var(--color-border)',
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