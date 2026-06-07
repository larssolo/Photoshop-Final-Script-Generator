import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseScriptToActions } from './_lib/scriptAI';
import { trySpend, refund, getCredits, isValidToken } from './_lib/credits';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, scriptContent } = req.body ?? {};

  if (!isValidToken(token)) return res.status(400).json({ error: 'Invalid token' });
  if (typeof scriptContent !== 'string' || !scriptContent.trim()) {
    return res.status(400).json({ error: 'Empty script' });
  }

  const spend = await trySpend(token);
  if (!spend.ok) {
    return res.status(402).json({ error: 'NO_CREDITS', credits: 0 });
  }

  try {
    const result = await parseScriptToActions(scriptContent);
    return res.status(200).json({ ...result, credits: spend.remaining });
  } catch (err) {
    await refund(token);
    const credits = await getCredits(token);
    const message = err instanceof Error ? err.message : 'Import failed';
    return res.status(502).json({ error: message, credits });
  }
}
