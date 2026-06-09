import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getUserIdFromBearer } from './_lib/credits.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserIdFromBearer(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const origin =
    (req.headers.origin as string) ||
    process.env.PUBLIC_APP_URL ||
    `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ID ?? '', quantity: 1 }],
      metadata: { token: user.id },
      invoice_creation: { enabled: true },
      success_url: `${origin}/?paid=1`,
      cancel_url: `${origin}/?canceled=1`,
      automatic_tax: { enabled: false },
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return res.status(500).json({ error: message });
  }
}
