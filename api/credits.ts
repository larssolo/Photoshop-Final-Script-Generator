import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCredits, isValidToken } from './_lib/credits';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.query.token;
  if (!isValidToken(token)) return res.status(400).json({ error: 'Invalid token' });

  const credits = await getCredits(token);
  // Don't let browsers/CDNs cache the balance.
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ credits });
}
