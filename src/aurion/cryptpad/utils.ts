import { getCurrentAccountId } from "../../util.ts";

export async function fetchCryptDriveSecret(): Promise<string | null> {
  const accountId = await getCurrentAccountId();
  return new Promise((resolve) => {
    const channel = new BroadcastChannel('pgp-session-bus');
    const requestId = Math.random().toString(36).substring(2);

    channel.onmessage = (event) => {
      if (event.data?.type === 'RESPONSE_CUSTOM_SECRET' && event.data?.requestId === requestId) {
        channel.close();
        resolve(event.data.secret);
      }
    };
    channel.postMessage({ type: 'REQUEST_CUSTOM_SECRET', requestId, salt: 'cryptpad-plugin', accountId });
  });
}