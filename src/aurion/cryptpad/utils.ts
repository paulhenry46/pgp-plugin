import { requestCustomSecret } from "../../pgp/session-broadcast.ts";

export async function fetchCryptDriveSecret(): Promise<string | null> {
  const {secret} = await requestCustomSecret('cryptpad-plugin', 'not_important')
  return secret;
}