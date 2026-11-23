import host from '@plugin-host';
import React, { useState, useCallback } from 'react';
import { initAurionAPI } from '../utils.ts';
import { processSecret } from '../secrets/sender.ts';
import { config } from '../../shared.ts';
import { sendToBridgeIframe } from '../secrets/sender.ts';
import { fetchCryptDriveSecret } from './utils.ts';

const h = React.createElement;

const BUTTON_STYLES_CSS = `
  .cryptpad-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 6px;
    justify-content: center;
    width: 100%;
    height: 40px;
    border: none;
    background-color: transparent;
    color: var(--color-muted-foreground);
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease;
  }
  .cryptpad-btn:hover:not(:disabled) { color: var(--color-foreground); }
  .cryptpad-btn:disabled { cursor: not-allowed; }
  @keyframes pulse-icon {
    0%, 100% { opacity: 1; }
    50% { opacity: .4; }
  }
  .cryptpad-btn-pulse { animation: pulse-icon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
`;

export function Navbar() {
  const [isProcessing, setIsProcessing] = useState(false);

  const openCryptPad = useCallback(async (logOutAll = false) => {
    setIsProcessing(true);

    try {
      const cryptpadDomain = await config('CryptpadURL');
      const secret = await fetchCryptDriveSecret();

      if (!secret) {
        host.toast.error("Unable to retrieve secret. Please ensure your default key is unlocked and try again.");
        return;
      }

      const { ciphertextHex, ivHex, seedHex } = await processSecret(secret);
      const accounts = await host.user.getAccounts();
      const defaultAccount = accounts.find((acc: any) => acc.isConnected && acc.isDefault);

      if (!defaultAccount) {
        host.toast.error("No default connected account found.");
        return;
      }

      const { avatarColor, email, serverUrl } = defaultAccount;
      const api = await initAurionAPI();
      const { id } = await api.createBridgeSecret(ciphertextHex);

      await sendToBridgeIframe(cryptpadDomain + '/bridge-minimal.html', cryptpadDomain, {
        type: 'WRITE_SECRET',
        secret: { id, seed: seedHex, iv: ivHex },
        mail: email,
        server: serverUrl,
        color: avatarColor,
        logoutAll: logOutAll ? Date.now() : false,
      });

      host.ui.openExternalUrl(`${cryptpadDomain}/login?from=aurion`);
    } catch (error) {
      host.toast.error(`An error occurred while fetching the CryptDrive secret: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  if (!shouldShowCryptpad({})) return null;

  return h(
    React.Fragment,
    null,
    h('style', null, BUTTON_STYLES_CSS),
    
    h('button', {
      onClick: () => openCryptPad(true),
      disabled: isProcessing,
      title: 'LogOutAll',
      className: 'cryptpad-btn',
      'aria-hidden': isProcessing ? 'true' : undefined
    }, 
      h('svg', {
        xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
        className: 'nav-icon'
      },
        h('path', { d: 'm19 5 3-3' }),
        h('path', { d: 'm2 22 3-3' }),
        h('path', { d: 'M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z' }),
        h('path', { d: 'M7.5 13.5 10 11' }),
        h('path', { d: 'M10.5 16.5 13 14' }),
        h('path', { d: 'm12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z' })
      )
    ),

    h('button', {
      onClick: () => openCryptPad(false),
      disabled: isProcessing,
      title: 'Cryptpad',
      className: 'cryptpad-btn',
      'aria-hidden': isProcessing ? 'true' : undefined
    }, 
      h('svg', {
        xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
        className: isProcessing ? 'cryptpad-btn-pulse' : '',
        style: { width: '18px', height: '18px', flexShrink: 0 },
        'aria-hidden': 'true'
      },
        h('path', { d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z' }),
        h('path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }),
        h('path', { d: 'M10 9H8' }),
        h('path', { d: 'M16 13H8' }),
        h('path', { d: 'M16 17H8' })
      )
    )
  );
}

export async function shouldShowCryptpad(extraProps: any) {
  return (await config('CryptpadURL')) !== '';
}