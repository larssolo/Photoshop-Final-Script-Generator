import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getCredits(token: string): Promise<number> {
  const { data } = await supabase
    .from('credits')
    .select('balance')
    .eq('token', token)
    .single();
  return typeof data?.balance === 'number' && data.balance > 0 ? data.balance : 0;
}

export async function trySpend(token: string): Promise<{ ok: boolean; remaining: number }> {
  // Atomic: only decrements if balance > 0, returns new balance
  const { data } = await supabase.rpc('spend_credit', { p_token: token });
  if (data === null || data < 0) return { ok: false, remaining: 0 };
  return { ok: true, remaining: data as number };
}

export async function refund(token: string): Promise<void> {
  await supabase.rpc('add_credits', { p_token: token, p_amount: 1 });
}

export async function addCredits(token: string, amount: number): Promise<number> {
  const { data } = await supabase.rpc('add_credits', { p_token: token, p_amount: amount });
  return typeof data === 'number' ? data : 0;
}

export function isValidToken(token: unknown): token is string {
  return typeof token === 'string' && token.length >= 16 && token.length <= 100;
}
