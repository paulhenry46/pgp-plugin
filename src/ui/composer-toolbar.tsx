import host from '@plugin-host';
import React from 'react';
const { useState, useEffect, useCallback } = React;

import { listKeyRecords } from '../storage.ts';
import { btn } from './shared.ts';
import { settings, INTENT_KEY } from '../shared.ts';
import { isCapable } from '../index.tsx';

interface PgpIntent {
  sign: boolean | undefined;
  encrypt: boolean | undefined;
}

export function ComposerToolbar() {
  const defaultSign = settings().defaultSign;
  const defaultEncrypt = settings().defaultEncrypt;
  
  const [intent, setIntent] = useState<PgpIntent>({ sign: defaultSign, encrypt: defaultEncrypt });
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await host.storage.set(INTENT_KEY, intent);
        if (!(await isCapable())) { if (alive) setReady(false); return; }
        const stored = (await host.storage.get(INTENT_KEY)) || {};
        
        if (alive) {
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


  const pill = (active: boolean | undefined) => ({
    ...btn,
    background: active ? 'var(--color-accent, #25eb43)' : 'var(--color-background, #141516)',
    color: active ? 'var(--color-accent-foreground, #ffffff)' : 'var(--color-foreground, #0f172a)',
  });

  if (!ready) {
    return (
    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
      <style>{`
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
      `}</style>

      <button
        type="button"
        aria-pressed={false}
        style={pill(false)}
        className="composer-btn"
        title={'OpenPGP: import a key in Settings to sign/encrypt'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="1rem" width="1rem" fill="currentColor"><path d="M12.74,16.69q0.31-0.31 0.31-0.74q0-0.42-0.31-0.74T12,14.9t-0.74,0.31t-0.31,0.74t0.31,0.74T12,17t0.74-0.31ZM12.03,13.9q0.3,0 0.54-0.22t0.24-0.53q0.03-0.17 0.07-0.34t0.15-0.31q0.18-0.25 0.39-0.45t0.41-0.4q0.42-0.42 0.74-0.95t0.31-1.15q0-1.13-0.86-1.84T12,7q-0.8,0-1.47,0.38T9.45,8.42Q9.3,8.7 9.41,8.98q0.11,0.28 0.41,0.4Q10.1,9.5 10.38,9.36Q10.65,9.23 10.85,9q0.22-0.28 0.51-0.41T12,8.45q0.55,0 0.96,0.32T13.38,9.6q0,0.42-0.26,0.79t-0.59,0.66q-0.28,0.28-0.55,0.54T11.5,12.18q-0.13,0.2-0.17,0.45t-0.05,0.5q0,0.32 0.21,0.55t0.54,0.22Zm-0.35,7.98q-0.15-0.02-0.3-0.07Q8,20.68 6,17.64T4,11.1V6.38Q4,5.75 4.36,5.25Q4.73,4.75 5.3,4.52l6-2.25Q11.65,2.15 12,2.15t0.7,0.13l6,2.25q0.58,0.23 0.94,0.73T20,6.38V11.1q0,3.5-2,6.54q-2,3.04-5.38,4.16q-0.15,0.05-0.3,0.07T12,21.9t-0.32-0.02Z"/></svg>
      </button>

    </div>
    )
  }

  return (
    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
      <style>{`
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
      `}</style>

      <button
        type="button"
        aria-pressed={!!intent.sign}
        style={pill(intent.sign)}
        className="composer-btn"
        title={host.i18n.t('toolbar.action.sign_title')}
        onClick={() => toggle('sign')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 -960 960 960" width="1rem" fill="currentColor">
          <path d="m438-452-58-57q-11-11-27.5-11T324-508q-11 11-11 28t11 28l86 86q12 12 28 12t28-12l170-170q12-12 11.5-28T636-592q-12-12-28.5-12.5T579-593L438-452ZM326-90l-58-98-110-24q-15-3-24-15.5t-7-27.5l11-113-75-86q-10-11-10-26t10-26l75-86-11-113q-2-15 7-27.5t24-15.5l110-24 58-98q8-13 22-17.5t28 1.5l104 44 104-44q14-6 28-1.5t22 17.5l58 98 110 24q15 3 24 15.5t7 27.5l-11 113 75 86q10 11 10 26t-10 26l-75 86 11 113q2 15-7 27.5T802-212l-110 24-58 98q-8 13-22 17.5T584-74l-104-44-104 44q-14 6-28 1.5T326-90Zm52-72 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Z" />
        </svg>
      </button>

      <button
        type="button"
        aria-pressed={!!intent.encrypt}
        style={pill(intent.encrypt)}
        className="composer-btn"
        title={host.i18n.t('toolbar.action.encrypt_title')}
        onClick={() => toggle('encrypt')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 -960 960 960" width="1rem" fill="currentColor">
          <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
        </svg>
      </button>
    </div>
  );
}