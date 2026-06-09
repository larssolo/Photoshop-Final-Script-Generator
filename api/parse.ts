import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseScriptToActions } from './_lib/scriptAI.js';
import { trySpend, refund, getCredits, getUserIdFromBearer } from './_lib/credits.js';

const isAdmin = (email: string) =>
  process.env.ADMIN_EMAIL ? email === process.env.ADMIN_EMAIL : false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserIdFromBearer(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const { scriptContent } = req.body ?? {};

  if (typeof scriptContent !== 'string' || !scriptContent.trim()) {
    return res.status(400).json({ error: 'Empty script' });
  }

  if (isAdmin(user.email)) {
    try {
      const result = await parseScriptToActions(scriptContent);
      return res.status(200).json({ ...result, credits: 999 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed';
      return res.status(502).json({ error: message, credits: 999 });
    }
  }

  const spend = await trySpend(user.id);
  if (!spend.ok) {
    return res.status(402).json({ error: 'NO_CREDITS', credits: 0 });
  }

  try {
    const result = await parseScriptToActions(scriptContent);
    return res.status(200).json({ ...result, credits: spend.remaining });
  } catch (err) {
    await refund(user.id);
    const credits = await getCredits(user.id);
    const message = err instanceof Error ? err.message : 'Import failed';
    return res.status(502).json({ error: message, credits });
  }
}
