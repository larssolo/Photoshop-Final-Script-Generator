import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseScriptToActions } from './_lib/scriptAI.js';
import { trySpend, refund, getCredits, getUserIdFromBearer } from './_lib/credits.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await getUserIdFromBearer(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { scriptContent } = req.body ?? {};

  if (typeof scriptContent !== 'string' || !scriptContent.trim()) {
    return res.status(400).json({ error: 'Empty script' });
  }

  const spend = await trySpend(userId);
  if (!spend.ok) {
    return res.status(402).json({ error: 'NO_CREDITS', credits: 0 });
  }

  try {
    const result = await parseScriptToActions(scriptContent);
    return res.status(200).json({ ...result, credits: spend.remaining });
  } catch (err) {
    await refund(userId);
    const credits = await getCredits(userId);
    const message = err instanceof Error ? err.message : 'Import failed';
    return res.status(502).json({ error: message, credits });
  }
}
