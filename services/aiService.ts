import { Action } from '../types';

/**
 * All AI work now happens on the server (see /api/*). The browser only holds an
 * anonymous "device token" used to track purchased credits — never the API key.
 */

const TOKEN_KEY = 'ps_device_token';

export function getDeviceToken(): string {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

/** Thrown when the user has run out of credits and must purchase more. */
export class NeedCreditsError extends Error {
  constructor() {
    super('NO_CREDITS');
    this.name = 'NeedCreditsError';
  }
}

async function postJson(url: string, body: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 402) {
    throw new NeedCreditsError();
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Request failed. Please try again.');
  }
  return data;
}

export async function generateScriptPrompt(actions: Action[], outputFolderName: string): Promise<string> {
  const data = await postJson('/api/generate', {
    token: getDeviceToken(),
    actions,
    outputFolderName,
  });
  return data.script as string;
}

export async function parseScriptToActions(
  scriptContent: string
): Promise<{ outputFolderName: string; actions: Action[] }> {
  const data = await postJson('/api/parse', {
    token: getDeviceToken(),
    scriptContent,
  });
  return { outputFolderName: data.outputFolderName, actions: data.actions };
}

/** Current credit balance for this device. */
export async function fetchCredits(): Promise<number> {
  const res = await fetch(`/api/credits?token=${encodeURIComponent(getDeviceToken())}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return typeof data.credits === 'number' ? data.credits : 0;
}

/** Start Stripe Checkout — redirects the browser to Stripe's hosted page. */
export async function startCheckout(): Promise<void> {
  const data = await postJson('/api/checkout', { token: getDeviceToken() });
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error('Could not start checkout. Please try again.');
  }
}
