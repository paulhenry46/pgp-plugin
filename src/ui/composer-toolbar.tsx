import host from '@plugin-host';
import React from 'react'
const h = React.createElement;
const { useState, useEffect, useCallback, useRef } = React;

import { listKeyRecords, saveAttachment } from '../storage.ts';
import { btn } from './shared.ts';
import { settings, INTENT_KEY } from '../shared.ts';
import { isCapable } from '../index.tsx';
import { generateUUID } from '../util.ts';

interface PgpIntent {
  sign: boolean | undefined;
  encrypt: boolean | undefined;
}

export function ComposerToolbar() {
  const defaultSign = settings().defaultSign;
  const defaultEncrypt = settings().defaultEncrypt;
  
  const [intent, setIntent] = useState<PgpIntent>({ sign: defaultSign, encrypt: defaultEncrypt });
  const [ready, setReady] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false); // État visuel pour l'upload
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await host.storage.set(INTENT_KEY, intent);
        if (!(await isCapable())) { if (alive) setReady(false); return; }
        const stored = (await host.storage.get(INTENT_KEY)) || {};
        
        if (alive) {
          console.log(settings());
          setIntent({
            sign: typeof stored.sign === 'boolean' ? stored.sign : !!settings().defaultSign,
            encrypt: typeof stored.encrypt === 'boolean' ? stored.encrypt : !!settings().defaultEncrypt,
          });
        }
        const recs = await listKeyRecords();
        if (alive) setReady(recs.length > 0);
      } catch { if (alive) setReady(false); }
    })();
    return () => { alive = false; };
  }, []);

  const update = useCallback(async (next: PgpIntent) => {
    setIntent(next);
    await host.storage.set(INTENT_KEY, next);
  }, []);

  const toggle = (key: keyof PgpIntent) => update({ ...intent, [key]: !intent[key] });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      // populate des fields dans l'interface d'attachement
      await saveAttachment({
        id: generateUUID(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        file: file
      });
    } catch (err) {
      console.error("Error when saving file :", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const pill = (active: boolean | undefined) => ({
    ...btn,
    background: active ? 'var(--color-accent, #25eb43)' : 'var(--color-background, #141516)',
    color: active ? '#fff' : 'var(--color-foreground, #0f172a)',
  });

  if (!ready) {
    return h('span', { style: { fontSize: '12px', color: 'var(--color-muted-foreground, #64748b)' } },
      'OpenPGP: import a key in Settings to sign/encrypt');
  }

  return h('div', { style: { display: 'inline-flex', gap: '6px', alignItems: 'center' } },

    h('style', null, `
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
      }
      .composer-btn:hover {
        background-color: var(--color-accent, #2563eb) !important;
        opacity: 1 !important;
      }
      .composer-btn:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed;
      }
    `),


    h('button', {
      type: 'button',
      style: pill(intent.sign),
      className: 'composer-btn',
      title: 'Digitally sign this message',
      onClick: () => toggle('sign'), 
    }, 
      h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '1rem', viewBox: '0 -960 960 960', width: '1rem', fill: 'currentColor' },
        h('path', { d: 'm438-452-58-57q-11-11-27.5-11T324-508q-11 11-11 28t11 28l86 86q12 12 28 12t28-12l170-170q12-12 11.5-28T636-592q-12-12-28.5-12.5T579-593L438-452ZM326-90l-58-98-110-24q-15-3-24-15.5t-7-27.5l11-113-75-86q-10-11-10-26t10-26l75-86-11-113q-2-15 7-27.5t24-15.5l110-24 58-98q8-13 22-17.5t28 1.5l104 44 104-44q14-6 28-1.5t22 17.5l58 98 110 24q15 3 24 15.5t7 27.5l-11 113 75 86q10 11 10 26t-10 26l-75 86 11 113q2 15-7 27.5T802-212l-110 24-58 98q-8 13-22 17.5T584-74l-104-44-104 44q-14 6-28 1.5T326-90Zm52-72 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Z' })
      )
    ),

    h('button', {
      type: 'button',
      style: pill(intent.encrypt),
      className: 'composer-btn',
      title: 'Encrypt this message to its recipients',
      onClick: () => toggle('encrypt'), 
    }, 
      h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '1rem', viewBox: '0 -960 960 960', width: '1rem', fill: 'currentColor' },
        h('path', { d: 'M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z' })
      )
    ),

    h('input', {
      type: 'file',
      ref: fileInputRef,
      style: { display: 'none' },
      onChange: handleFileChange
    }),

    h('button', {
      type: 'button',
      style: pill(false),
      className: 'composer-btn',
      title: uploading ? 'Uploading...' : 'Add attachment to IndexedDB',
      disabled: uploading,
      onClick: triggerFileSelect, 
    }, 
      h('svg', { xmlns: 'http://www.w3.org/2000/svg', height: '1rem', viewBox: '0 -960 960 960', width: '1rem', fill: 'currentColor' },
        h('path', { d: 'M588.5-411.5Q600-423 600-440v-80h80q17 0 28.5-11.5T720-560q0-17-11.5-28.5T680-600h-80v-80q0-17-11.5-28.5T560-720q-17 0-28.5 11.5T520-680v80h-80q-17 0-28.5 11.5T400-560q0 17 11.5 28.5T440-520h80v80q0 17 11.5 28.5T560-400q17 0 28.5-11.5ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-520q0-17 11.5-28.5T120-720q17 0 28.5 11.5T160-680v520h520q17 0 28.5 11.5T720-120q0 17-11.5 28.5T680-80H160Zm160-720v480-480Z' })
      )
    )
  );
}