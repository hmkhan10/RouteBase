import Redis from 'ioredis'

// Redis configuration for production scaling
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  keyPrefix: 'routebase:',
}

// Singleton Redis instance
let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(redisConfig)
    
    redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })
    
    redis.on('connect', () => {
      console.log('Redis connected successfully')
    })
    
    redis.on('disconnect', () => {
      console.log('Redis disconnected')
    })
  }
  
  return redis
}

// Redis utility functions for session management
export class RedisSessionManager {
  private redis: Redis
  
  constructor() {
    this.redis = getRedis()
  }
  
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data))
  }
  
  async getSession(sessionId: string): Promise<any | null> {
    const data = await this.redis.get(`session:${sessionId}`)
    return data ? JSON.parse(data) : null
  }
  
  async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`)
  }
  
  async updateSession(sessionId: string, data: any): Promise<void> {
    const existing = await this.getSession(sessionId)
    if (existing) {
      await this.setSession(sessionId, { ...existing, ...data })
    }
  }
}

// Redis utility functions for caching
export class RedisCacheManager {
  private redis: Redis
  
  constructor() {
    this.redis = getRedis()
  }
  
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    await this.redis.setex(`cache:${key}`, ttl, JSON.stringify(value))
  }
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(`cache:${key}`)
    return data ? JSON.parse(data) : null
  }
  
  async del(key: string): Promise<void> {
    await this.redis.del(`cache:${key}`)
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(`cache:${pattern}`)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}

// Redis utility functions for rate limiting
export class RedisRateLimiter {
  private redis: Redis
  
  constructor() {
    this.redis = getRedis()
  }
  
  async isAllowed(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.redis.incr(`rate:${key}`)
    
    if (current === 1) {
      await this.redis.expire(`rate:${key}`, window)
    }
    
    return current <= limit
  }
  
  async getRemainingRequests(key: string, limit: number): Promise<number> {
    const current = await this.redis.get(`rate:${key}`)
    return current ? Math.max(0, limit - parseInt(current)) : limit
  }
}

// Redis utility functions for distributed locks
export class RedisLockManager {
  private redis: Redis
  
  constructor() {
    this.redis = getRedis()
  }
  
  async acquireLock(key: string, ttl: number = 30): Promise<string | null> {
    const lockKey = `lock:${key}`
    const lockValue = `${Date.now()}-${Math.random()}`
    
    const result = await this.redis.set(lockKey, lockValue, 'PX', ttl * 1000, 'NX')
    return result === 'OK' ? lockValue : null
  }
  
  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    const lockKey = `lock:${key}`
    
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `
    
    const result = await this.redis.eval(script, 1, lockKey, lockValue)
    return result === 1
  }
  
  async extendLock(key: string, lockValue: string, ttl: number = 30): Promise<boolean> {
    const lockKey = `lock:${key}`
    
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("pexpire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `
    
    const result = await this.redis.eval(script, 1, lockKey, lockValue, ttl * 1000)
    return result === 1
  }
}

export { getRedis as redis }
