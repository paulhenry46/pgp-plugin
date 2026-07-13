const DEFAULT_BASE_URL = "https://keys.openpgp.org";

export interface KeyServerOptions {
  baseUrl?: string;
}

export type KeyStatus = "unpublished" | "pending" | "published" | "revoked";

export interface UploadResponse {
  key_fpr: string;
  token: string;
  status: Record<string, KeyStatus>;
}

export interface LookupResult {
  email: string;
  armored: string | null;
}

function getBaseUrl(opts?: KeyServerOptions): string {
  return String((opts && opts.baseUrl) || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

async function getArmored(url: string): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/pgp-keys" }, redirect: "follow" });
  } catch (_) {
    throw new Error("Could not reach the keyserver — the network request was blocked or failed.");
  }

  if (res.status === 404) return null; // No such key
  if (!res.ok) throw new Error(`Keyserver returned HTTP ${res.status}.`);

  const text = await res.text();
  if (!/BEGIN PGP PUBLIC KEY BLOCK/.test(text)) {
    throw new Error("Keyserver did not return a valid OpenPGP public key.");
  }
  return text;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch (_) {
    throw new Error("Could not reach the keyserver — the network request was blocked or failed.");
  }

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* Non-JSON response body */
  }

  if (!res.ok) {
    throw new Error((json && (json.error || json.message)) || `Keyserver returned HTTP ${res.status}.`);
  }

  return (json || {}) as T;
}

/** * GET the armored key for an (owner-verified) email address, or null if not found.
 */
export function lookupByEmail(email: string, opts?: KeyServerOptions): Promise<string | null> {
  const e = String(email || "").trim();
  if (!e.includes("@")) throw new Error("A valid email address is required.");
  return getArmored(`${getBaseUrl(opts)}/vks/v1/by-email/${encodeURIComponent(e.toLowerCase())}`);
}

/**
 * Upload an armored PUBLIC key to the keyserver.
 */
export function uploadKey(armoredPublicKey: string, opts?: KeyServerOptions): Promise<UploadResponse> {
  if (!/BEGIN PGP PUBLIC KEY BLOCK/.test(String(armoredPublicKey || ""))) {
    throw new Error("A valid public key block is required to publish.");
  }
  return postJson<UploadResponse>(`${getBaseUrl(opts)}/vks/v1/upload`, { keytext: armoredPublicKey });
}

/**
 * Ask the keyserver to email verification links to `addresses` so they become searchable by email.
 * The `token` comes from a prior uploadKey() response.
 */
export function requestVerify(token: string, addresses: string[], opts?: KeyServerOptions): Promise<Record<string, unknown>> {
  if (!token) throw new Error("Missing upload token.");
  return postJson<Record<string, unknown>>(`${getBaseUrl(opts)}/vks/v1/request-verify`, {
    token,
    addresses,
    locale: [],
  });
}

/**
 * Simple lookup wrapper helper that processes a raw email query.
 */
export async function lookup(rawEmail: string, opts?: KeyServerOptions): Promise<LookupResult> {
  const e = String(rawEmail || "").trim();
  if (!e.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }
  
  const normalizedEmail = e.toLowerCase();
  const armored = await lookupByEmail(normalizedEmail, opts);
  return { email: normalizedEmail, armored };
}