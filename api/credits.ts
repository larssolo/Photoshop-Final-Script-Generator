import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCredits, getUserIdFromBearer } from './_lib/credits.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserIdFromBearer(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const credits = await getCredits(user.id);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ credits });
}
