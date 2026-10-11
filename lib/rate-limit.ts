import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ratelimit:',
})

export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'ratelimit:auth:',
})

export const adminRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: 'ratelimit:admin:',
})

export async function checkRateLimit(
  identifier: string,
  type: 'default' | 'auth' | 'admin' = 'default'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = type === 'auth' ? authRatelimit : type === 'admin' ? adminRatelimit : ratelimit
  return limiter.limit(identifier)
}