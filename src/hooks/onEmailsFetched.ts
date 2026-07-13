import { fetchPreviewsBatchFromBackground } from "../pgp/session-broadcast.ts";


//Reducted interface for the email object, focusing on the properties we care about
interface Email {
  id: string;
  preview?: string;
  [key: string]: any; // for other existing properties
}

export async function onEmailsFetched(emails: Email[]): Promise<Email[]> {
  const emailIds = emails.map(email => email.id);

  // Fetch the previews batch from the background
  const result: Record<string, string> = await fetchPreviewsBatchFromBackground(emailIds);
  
  // Map through emails and update the preview if it exists in the result
  return emails.map(email => {
    if (result[email.id] !== undefined) {
      return {
        ...email,
        preview: result[email.id]
      };
    }
    return email; // leaves the email untouched if ID doesn't exist in result
  });
}