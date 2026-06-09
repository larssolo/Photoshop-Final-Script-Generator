import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Verify a Bearer JWT and return the user's id + email, or null if invalid. */
export async function getUserIdFromBearer(authHeader: string | undefined): Promise<{ id: string; email: string } | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const jwt = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(jwt);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? '' };
}

export async function getCredits(userId: string): Promise<number> {
  const { data } = await supabase
    .from('credits')
    .select('balance')
    .eq('token', userId)
    .single();
  return typeof data?.balance === 'number' && data.balance > 0 ? data.balance : 0;
}

export async function trySpend(userId: string): Promise<{ ok: boolean; remaining: number }> {
  const { data } = await supabase.rpc('spend_credit', { p_token: userId });
  if (data === null || data < 0) return { ok: false, remaining: 0 };
  return { ok: true, remaining: data as number };
}

export async function refund(userId: string): Promise<void> {
  await supabase.rpc('add_credits', { p_token: userId, p_amount: 1 });
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  const { data } = await supabase.rpc('add_credits', { p_token: userId, p_amount: amount });
  return typeof data === 'number' ? data : 0;
}

/** Used only by stripe-webhook where we trust the metadata token from Stripe. */
export function isValidToken(token: unknown): token is string {
  return typeof token === 'string' && token.length >= 16 && token.length <= 100;
}
