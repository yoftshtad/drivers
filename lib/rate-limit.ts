import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

// If Redis not configured, disable rate limiting (allow all)
const disabled = !redisUrl || !redisToken

const redis = disabled ? null : new Redis({
  url: redisUrl!,
  token: redisToken!,
})

export const ratelimit = disabled ? null : new Ratelimit({
  redis: redis!,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:',
})

export const authRatelimit = disabled ? null : new Ratelimit({
  redis: redis!,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'ratelimit:auth:',
})

export const adminRatelimit = disabled ? null : new Ratelimit({
  redis: redis!,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:admin:',
})

export async function checkRateLimit(
  identifier: string,
  type: 'default' | 'auth' | 'admin' = 'default'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (disabled) {
    return { success: true, limit: 999, remaining: 999, reset: Date.now() + 60000 }
  }
  
  const limiter = type === 'auth' ? authRatelimit : type === 'admin' ? adminRatelimit : ratelimit
  return limiter!.limit(identifier)
}