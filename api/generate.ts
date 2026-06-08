import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateScriptPrompt } from './_lib/scriptAI.js';
import { trySpend, refund, getCredits, getUserIdFromBearer } from './_lib/credits.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await getUserIdFromBearer(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { actions, outputFolderName } = req.body ?? {};

  if (!Array.isArray(actions) || actions.length === 0) {
    return res.status(400).json({ error: 'No actions provided' });
  }
  if (typeof outputFolderName !== 'string' || !outputFolderName.trim()) {
    return res.status(400).json({ error: 'Missing output folder name' });
  }

  const spend = await trySpend(userId);
  if (!spend.ok) {
    return res.status(402).json({ error: 'NO_CREDITS', credits: 0 });
  }

  try {
    const script = await generateScriptPrompt(actions, outputFolderName);
    return res.status(200).json({ script, credits: spend.remaining });
  } catch (err) {
    await refund(userId);
    const credits = await getCredits(userId);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return res.status(502).json({ error: message, credits });
  }
}
