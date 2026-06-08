import { createClient, User } from '@supabase/supabase-js';
import { Action } from '../types';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

/** Thrown when the user has run out of credits and must purchase more. */
export class NeedCreditsError extends Error {
  constructor() {
    super('NO_CREDITS');
    this.name = 'NeedCreditsError';
  }
}

/** Send a magic-link email. Supabase handles delivery. */
export async function signInWithEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return data.subscription;
}

async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('NOT_AUTHENTICATED');
  return token;
}

async function postJson(url: string, body: unknown): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 402) throw new NeedCreditsError();

  let data: any = null;
  try { data = await res.json(); } catch { /* non-JSON */ }

  if (!res.ok) throw new Error(data?.error || 'Request failed. Please try again.');
  return data;
}

export async function generateScriptPrompt(actions: Action[], outputFolderName: string): Promise<string> {
  const data = await postJson('/api/generate', { actions, outputFolderName });
  return data.script as string;
}

export async function parseScriptToActions(
  scriptContent: string
): Promise<{ outputFolderName: string; actions: Action[] }> {
  const data = await postJson('/api/parse', { scriptContent });
  return { outputFolderName: data.outputFolderName, actions: data.actions };
}

export async function fetchCredits(): Promise<number> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return 0;
  const res = await fetch('/api/credits', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return typeof json.credits === 'number' ? json.credits : 0;
}

export async function startCheckout(): Promise<void> {
  const data = await postJson('/api/checkout', {});
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error('Could not start checkout. Please try again.');
  }
}
