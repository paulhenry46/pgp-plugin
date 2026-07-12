import { executeSearchInBackground } from "../pgp/session-broadcast.ts";

interface SearchInput {
    newEmailIds: string[], 
        result: any, 
        query: string, 
        filters: any 
}

export async function onSearchResults(input: SearchInput): Promise<SearchInput>{
    input.newEmailIds = await executeSearchInBackground(input.query);
    return input;
}