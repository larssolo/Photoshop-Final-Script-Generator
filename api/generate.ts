import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateScriptPrompt } from './_lib/scriptAI.js';
import { trySpend, refund, getCredits, isValidToken } from './_lib/credits.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, actions, outputFolderName } = req.body ?? {};

  if (!isValidToken(token)) return res.status(400).json({ error: 'Invalid token' });
  if (!Array.isArray(actions) || actions.length === 0) {
    return res.status(400).json({ error: 'No actions provided' });
  }
  if (typeof outputFolderName !== 'string' || !outputFolderName.trim()) {
    return res.status(400).json({ error: 'Missing output folder name' });
  }

  // Spend a credit up front (atomic). If none, ask the user to buy more.
  const spend = await trySpend(token);
  if (!spend.ok) {
    return res.status(402).json({ error: 'NO_CREDITS', credits: 0 });
  }

  try {
    const script = await generateScriptPrompt(actions, outputFolderName);
    return res.status(200).json({ script, credits: spend.remaining });
  } catch (err) {
    // The AI call failed — refund the credit so the user isn't charged.
    await refund(token);
    const credits = await getCredits(token);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return res.status(502).json({ error: message, credits });
  }
}
