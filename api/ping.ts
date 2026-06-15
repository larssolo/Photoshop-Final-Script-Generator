import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Lightweight query just to keep Supabase active
  await supabase.from('credits').select('token').limit(1);
  return res.status(200).json({ ok: true, ts: new Date().toISOString() });
}
