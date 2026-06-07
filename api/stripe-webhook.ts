import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { addCredits, isValidToken } from './_lib/credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

// Stripe signature verification needs the raw, unparsed body.
export const config = { api: { bodyParser: false } };

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'] as string | undefined;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  let event: Stripe.Event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const token = session.metadata?.token;
    const amount = Number(process.env.CREDITS_PER_PURCHASE ?? '4');
    if (isValidToken(token)) {
      await addCredits(token, amount);
    }
  }

  return res.status(200).json({ received: true });
}
