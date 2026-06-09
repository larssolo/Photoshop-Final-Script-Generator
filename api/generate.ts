import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateScriptPrompt } from './_lib/scriptAI.js';
import { trySpend, refund, getCredits, getUserIdFromBearer } from './_lib/credits.js';

const isAdmin = (email: string) =>
  process.env.ADMIN_EMAIL ? email === process.env.ADMIN_EMAIL : false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserIdFromBearer(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const { actions, outputFolderName } = req.body ?? {};

  if (!Array.isArray(actions) || actions.length === 0) {
    return res.status(400).json({ error: 'No actions provided' });
  }
  if (typeof outputFolderName !== 'string' || !outputFolderName.trim()) {
    return res.status(400).json({ error: 'Missing output folder name' });
  }

  if (isAdmin(user.email)) {
    try {
      const script = await generateScriptPrompt(actions, outputFolderName);
      return res.status(200).json({ script, credits: 999 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      return res.status(502).json({ error: message, credits: 999 });
    }
  }

  const spend = await trySpend(user.id);
  if (!spend.ok) {
    return res.status(402).json({ error: 'NO_CREDITS', credits: 0 });
  }

  try {
    const script = await generateScriptPrompt(actions, outputFolderName);
    return res.status(200).json({ script, credits: spend.remaining });
  } catch (err) {
    await refund(user.id);
    const credits = await getCredits(user.id);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return res.status(502).json({ error: message, credits });
  }
}
