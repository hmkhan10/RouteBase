// Mock Redis implementation for testing without Redis server
class MockRedis {
  private data: Map<string, any> = new Map()
  private expirations: Map<string, number> = new Map()

  async connect() {
    console.log('Mock Redis connected')
  }

  async ping() {
    return 'PONG'
  }

  async set(key: string, value: any, mode?: string, duration?: number, nx?: string) {
    this.data.set(key, value)
    if (duration) {
      this.expirations.set(key, Date.now() + duration)
    }
    return 'OK'
  }

  async setex(key: string, seconds: number, value: any) {
    return this.set(key, value, 'PX', seconds * 1000)
  }

  async get(key: string) {
    const expiration = this.expirations.get(key)
    if (expiration && Date.now() > expiration) {
      this.data.delete(key)
      this.expirations.delete(key)
      return null
    }
    return this.data.get(key) || null
  }

  async del(...keys: string[]) {
    let deleted = 0
    keys.forEach(key => {
      if (this.data.delete(key)) {
        deleted++
      }
      this.expirations.delete(key)
    })
    return deleted
  }

  async incr(key: string) {
    const current = parseInt(this.data.get(key) || '0')
    const newValue = current + 1
    this.data.set(key, newValue.toString())
    return newValue
  }

  async keys(pattern: string) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    const keys = Array.from(this.data.keys()).filter(key => regex.test(key))
    return keys
  }

  async eval(script: string, numKeys: number, ...args: any[]) {
    // Simple mock for distributed lock script
    if (script.includes('get') && script.includes('del')) {
      const [key, expectedValue] = args
      const currentValue = this.data.get(key)
      if (currentValue === expectedValue) {
        this.data.delete(key)
        return 1
      }
      return 0
    }
    return 0
  }

  async info(section?: string) {
    return `
# Server
redis_version:7.0.0
redis_git_sha1:00000000
redis_git_dirty:0
redis_build_id:test
redis_mode:standalone
os:Linux 64-bit
arch_bits:64
multiplexing_api:epoll
process_id:1
run_id:test123
tcp_port:6379
uptime_in_seconds:100
uptime_in_days:0
hz:10
configured_hz:10
lru_clock:16777215
executable:/usr/local/bin/redis-server
config_file:

# Memory
used_memory_human:1.00M
used_memory:1048576
used_memory_human:1.00M
used_memory_rss_human:2.00M
used_memory_peak_human:1.00M
used_memory_peak:1048576
total_system_memory_human:8.00G

# Clients
connected_clients:1
client_recent_max_input_buffer:0
client_recent_max_output_buffer:0
blocked_clients:0
`
  }

  on(event: string, callback: Function) {
    // Mock event listeners
    if (event === 'error') {
      // Store callback for potential errors
    }
  }
}

// Mock Redis instance
let mockRedisInstance: MockRedis | null = null

export function getRedis() {
  if (!mockRedisInstance) {
    mockRedisInstance = new MockRedis()
    mockRedisInstance.connect()
  }
  return mockRedisInstance
}

// Export MockRedis class for testing
export { MockRedis }
