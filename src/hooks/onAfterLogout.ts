import { config, settings } from '../shared.ts';
import { clearAllMessageCache, clearDangerousStorage, deleteAllKeyRecords } from '../storage.ts'

export async function onAfterLogout(args: {accountId:string}) {
  if(settings().removeOnLogout || await config('forceRemoveOnLogout')){
    await clearDangerousStorage(args.accountId);
    await deleteAllKeyRecords(args.accountId);
    await clearAllMessageCache(args.accountId);
  }
}