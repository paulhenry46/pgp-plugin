import host from '@plugin-host';
export const CHANNEL_NAME = 'aurion-session-bus';

let _masterPass: string | undefined = undefined;

type SessionMessage =
  { type: 'INITIALIZE_MASTER_PASS'; masterPass: string }// This is called if a secret is detected, i.e. the user has tape its password a fosrt time to connect AURION
  | { type: 'REQUEST_MASTER_PASS'; requestId: string; }// AURION
  | { type: 'RESPONSE_MASTER_PASS'; requestId: string; masterPass: string | undefined  }// AURION
  | { type: 'LOGOUT_REQUEST'; requestId: string; }// AURION
  | { type: 'RESPONSE_LOGOUT_REQUEST'; requestId: string;   };// AURION


export function initAurionBackgroundSessionListener(): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = (event: MessageEvent<SessionMessage>) => {
    const msg = event.data;

    switch (msg.type) {
     
      case 'INITIALIZE_MASTER_PASS':
        _masterPass = msg.masterPass;
        break;
      case 'REQUEST_MASTER_PASS': {
        
        channel.postMessage({
          type: 'RESPONSE_MASTER_PASS',
          requestId: msg.requestId,
          masterPass: _masterPass
        });
        break;
      }
      case 'LOGOUT_REQUEST': {
        console.log('logout request received');
        channel.postMessage({
          type: 'RESPONSE_LOGOUT_REQUEST',
          requestId: msg.requestId
        });
        host.storage.set('logoutAsked', Date.now());
        host.storage.set('forceLogout', Date.now());
        host.user.logout();
        break;
      }
    }
  };
}

export function broadcastInitializeMasterPass(masterPass: string): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  console.log("broadcastInitializeMasterPass: broadcasting masterPass to background");
  channel.postMessage({ type: 'INITIALIZE_MASTER_PASS', masterPass });
  channel.close();
}

export function getMasterPass(): Promise<string | undefined> {
    console.log("getMasterPass: requesting masterPass from background");
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const requestId = Math.random().toString(36).substring(2);

    const timeout = setTimeout(() => {
      channel.close();
      resolve(undefined);
    }, 300); // Protection anti-blocage

    channel.onmessage = (event: MessageEvent<SessionMessage>) => {
      const msg = event.data;
      if (msg.type === 'RESPONSE_MASTER_PASS' && msg.requestId === requestId) {
        clearTimeout(timeout);
        channel.close();
        console.log("getMasterPass: received masterPass from background:", msg.masterPass);
        resolve(msg.masterPass);
      }
    };

    channel.postMessage({ type: 'REQUEST_MASTER_PASS', requestId });
  });
}