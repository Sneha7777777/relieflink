/**
 * Simple sliding-window rate limiter.
 *
 * In production on serverless (Vercel), in-memory state is per-instance and
 * best-effort only — for strict guarantees, swap this for Upstash Redis
 * (env vars are already scaffolded in .env.example). This module is written
 * so that swap is a one-file change: just replace the Map with Redis calls.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

export function clientKey(req: Request, suffix: string) {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? (fwd.split(",")[0] ?? "unknown").trim() : "unknown";
  return `${ip}:${suffix}`;
}
