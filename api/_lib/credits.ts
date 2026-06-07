import { Redis } from '@upstash/redis';

// Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from the environment.
const redis = Redis.fromEnv();

const key = (token: string) => `credits:${token}`;

/** Current credit balance for a device token (0 if unknown). */
export async function getCredits(token: string): Promise<number> {
  const n = await redis.get<number>(key(token));
  return typeof n === 'number' && n > 0 ? n : 0;
}

/**
 * Atomically spend one credit.
 * Decrements first (atomic), and if the result is negative the token had no
 * credits — we immediately refund and report failure. This prevents two
 * concurrent requests from both spending the last credit.
 */
export async function trySpend(token: string): Promise<{ ok: boolean; remaining: number }> {
  const next = await redis.decr(key(token));
  if (next < 0) {
    await redis.incr(key(token)); // undo: restore to 0
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining: next };
}

/** Refund one credit (used when an AI call fails after spending). */
export async function refund(token: string): Promise<void> {
  await redis.incr(key(token));
}

/** Add credits after a successful purchase. Returns the new balance. */
export async function addCredits(token: string, amount: number): Promise<number> {
  return await redis.incrby(key(token), amount);
}

/** Basic sanity check on a client-supplied device token. */
export function isValidToken(token: unknown): token is string {
  return typeof token === 'string' && token.length >= 16 && token.length <= 100;
}
