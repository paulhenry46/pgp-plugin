import host from '@plugin-host';

export const CHANNEL_NAME = 'aurion-session-bus';

const AURION_HOST_PROP = '__aurionSessionHost';
const AURION_HOST_METHODS = ['setMasterPass', 'getMasterPass', 'clearMasterPass'] as const;

let _isAurionSessionHost = false;
let _masterPass: string | undefined = undefined;

interface AurionSessionHost {
  setMasterPass(masterPass: string): void;
  getMasterPass(): string | undefined;
  clearMasterPass(): void;
}

type SessionMessage =
  | { type: 'LOGOUT_REQUEST'; requestId: string }
  | { type: 'RESPONSE_LOGOUT_REQUEST'; requestId: string };

function findAurionSessionHost(): AurionSessionHost | null {
  let frames: any;
  try {
    frames = (globalThis as any).parent?.frames;
  } catch {
    return null;
  }

  const count = Number(frames?.length) || 0;
  for (let i = 0; i < count; i++) {
    try {
      const candidate = frames[i]?.[AURION_HOST_PROP];
      if (candidate && AURION_HOST_METHODS.every((name) => typeof candidate[name] === 'function')) {
        return candidate as AurionSessionHost;
      }
    } catch {
    }
  }
  return null;
}

export function initAurionBackgroundSessionListener(): void {
  _isAurionSessionHost = true;

  const sessionHost: AurionSessionHost = Object.freeze({
    setMasterPass(masterPass: string) {
      _masterPass = masterPass;
    },
    getMasterPass(): string | undefined {
      return _masterPass;
    },
    clearMasterPass() {
      _masterPass = undefined;
    },
  });

  Object.defineProperty(globalThis, AURION_HOST_PROP, {
    value: sessionHost,
    configurable: true,
  });

  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = (event: MessageEvent<SessionMessage>) => {
    const msg = event.data;

    if (msg.type === 'LOGOUT_REQUEST') {
      console.log('logout request received');
      _masterPass = undefined;
      channel.postMessage({
        type: 'RESPONSE_LOGOUT_REQUEST',
        requestId: msg.requestId,
      });
      host.storage.set('logoutAsked', Date.now());
      host.storage.set('forceLogout', Date.now());
      host.user.logout();
    }
  };
}

export function broadcastInitializeMasterPass(masterPass: string): void {
  if (_isAurionSessionHost) {
    _masterPass = masterPass;
    return;
  }

  const sessionHost = findAurionSessionHost();
  if (!sessionHost) {
    console.warn('[Aurion] No background frame found in this tab: masterPass not stored.');
    return;
  }
  sessionHost.setMasterPass(masterPass);
}

export async function getMasterPass(): Promise<string | undefined> {
  if (_isAurionSessionHost) {
    return _masterPass;
  }
  return findAurionSessionHost()?.getMasterPass();
}