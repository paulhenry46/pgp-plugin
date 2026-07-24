import host from '@plugin-host';
import React from 'react';
import { decodePgpUri, extractKeyInfo } from '../pgp/key-utils.ts';
import { ContactCryptoKey } from '../util.ts';
import * as openpgp from 'openpgp';

const h = React.createElement;
const { useState, useEffect, useCallback } = React;

interface Info {
  subject: string;
  issuer: string;
  serialNumber: string;
  notBefore: string;
  notAfter: string | null;
  fingerprint: string;
  algorithm: string;
  keyUsage: string[];
  extendedKeyUsage: never[];
  emailAddresses: string[];
  capabilities: any;
  armoredPublicKey: string;
}

const cardStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '0.375rem',
  border: '1px solid var(--color-border, #e2e8f0)',
  backgroundColor: 'var(--color-card, #ffffff)',
};

async function getKeyInfo(cryptoKeys: ContactCryptoKey[]): Promise<Info[]> {
  const keysList = Object.values(cryptoKeys || {}).filter(
    (key) => key.mediaType === 'application/pgp-keys' || key.uri?.startsWith('data:application/pgp-keys')
  );

  const results = await Promise.all(
    keysList.map(async (cryptoKeyEntry) => {
      try {
        const armoredKey = decodePgpUri(cryptoKeyEntry.uri);
        const readKey = await openpgp.readKey({ armoredKey });
        return await extractKeyInfo(readKey);
      } catch (e) {
        return undefined;
      }
    })
  );

  return results.filter((info): info is Info => info !== undefined);
}

export function ContactCrypto(keys: any) {
  const [keyList, setKeyList] = useState<Info[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    getKeyInfo(keys?.cryptoKeys).then((infos) => {
      if (isMounted) {
        setKeyList(infos);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [keys]);

  const handleDownload = useCallback((armoredKey: string, fingerprint: string) => {
    host.ui.downloadFile({
      filename: `${fingerprint}.asc`,
      content: armoredKey,
      contentType: 'application/pgp-keys',
    });
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isExpired = (notAfter: string | null) => {
    if (!notAfter) return false;
    return new Date(notAfter) < new Date();
  };

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },

    /* Définition des classes de boutons avec survol et variables CSS */
    h(
      'style',
      null,
      `
      .composer-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.375rem;
        font-weight: 500;
        height: 2.25rem;
        padding: 0 1rem;
        cursor: pointer;
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid var(--color-border, #e2e8f0);
        background-color: var(--color-background, #ffffff);
        color: var(--color-foreground, #0f172a);
        font-size: 13px;
      }
      .composer-btn:hover {
        background-color: var(--color-accent, #2563eb) !important;
        color: var(--color-accent-foreground, #ffffff) !important;
        opacity: 1 !important;
      }
      .composer-btn:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed;
      }
    `
    ),

    h(
      'div',
      null,

      loading
        ? h(
            'div',
            {
              style: {
                ...cardStyle,
                fontSize: '13px',
                color: 'var(--color-muted-foreground, #64748b)',
              },
            },
            host.i18n.t('contact.loading')
          )
        : keyList.length === 0
        ? h(
            'div',
            {
              style: {
                ...cardStyle,
                fontSize: '13px',
                color: 'var(--color-muted-foreground, #64748b)',
              },
            },
            host.i18n.t('contact.no_keys_found')
          )
        : h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            keyList.map((rec, idx) => {
              const expired = isExpired(rec.notAfter);
              const createdDate = formatDate(rec.notBefore);
              const expiresDate = formatDate(rec.notAfter);

              const createdText = createdDate ? ` · ${host.i18n.t('contact.created_at')} ${createdDate}` : '';
              const expiresText = expiresDate
                ? ` · ${host.i18n.t('contact.expires_at')} ${expiresDate}`
                : ` · ${host.i18n.t('contact.no_expiration')}`;

              return h(
                'div',
                {
                  key: rec.fingerprint || idx,
                  style: {
                    ...cardStyle,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  },
                },
                /* Informations de la clé */
                h(
                  'div',
                  { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                  h(
                    'div',
                    { style: { fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' } },
                    rec.emailAddresses?.[0] || rec.subject || host.i18n.t('contact.default_key_name'),
                    /* Badge État */
                    expired
                      ? h(
                          'span',
                          {
                            style: {
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'var(--color-destructive, #b91c1c)',
                              color: 'var(--color-destructive-foreground, #b91c1c)',
                              fontWeight: 'normal',
                              border: '1px solid #fecaca',
                            },
                          },
                          host.i18n.t('contact.badge_expired')
                        )
                      : h(
                          'span',
                          {
                            style: {
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'var(--color-success, #e0f2fe)',
                              color: 'var(--color-success-foreground, #0369a1)',
                              fontWeight: 'normal',
                            },
                          },
                          'OK'
                        )
                  ),
                  /* Metadonnées (Algorithme + Dates) */
                  h(
                    'div',
                    { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' } },
                    `PGP · ${rec.algorithm || 'PGP'}${createdText}${expiresText}`
                  ),
                  /* Empreinte */
                  h(
                    'div',
                    {
                      style: {
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: 'var(--color-muted-foreground, #64748b)',
                        wordBreak: 'break-all',
                      },
                    },
                    rec.fingerprint
                  ),
                ),

                /* Bouton d'action Télécharger */
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'composer-btn',
                    onClick: () => handleDownload(rec.armoredPublicKey, rec.fingerprint),
                    title: host.i18n.t('contact.download_title'),
                  },
                  [
                    h(
                      'svg',
                      {
                        xmlns: 'http://www.w3.org/2000/svg',
                        width: '1rem',
                        height: '1rem',
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: '2',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        style: { marginRight: '0.5rem' },
                        'aria-hidden': 'true',
                      },
                      [
                        h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
                        h('polyline', { points: '7 10 12 15 17 10' }),
                        h('line', { x1: '12', y1: '15', x2: '12', y2: '3' }),
                      ]
                    ),
                    host.i18n.t('contact.download_button'),
                  ]
                )
              );
            })
          )
    )
  );
}