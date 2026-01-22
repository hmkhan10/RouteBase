# Redis Configuration for RouteBases Platform

## Installation

### Option 1: Local Installation (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server redis-tools
sudo systemctl start redis-server
sudo systemctl enable redis-server
redis-cli ping  # Should return PONG
```

### Option 2: Docker (Recommended for Development)
```bash
docker run -d --name routebase-redis -p 6379:6379 redis:7-alpine
```

### Option 3: Redis Cloud (Production)
- Sign up at https://redis.com/try-free/
- Create a free database
- Get connection string and update environment variables

## Environment Variables

Add these to your `.env.local` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty for local development

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Testing Redis Connection

```bash
# Test connection
redis-cli ping

# Test with password (if set)
redis-cli -a your_password ping

# Check Redis info
redis-cli info server
```

## Redis Usage in RouteBases

### Session Management
- User sessions stored with TTL of 1 hour
- Automatic cleanup of expired sessions
- Session data includes cart items, user activity, and metadata

### Caching
- Product inventory cached for 1 minute
- Payment results cached for 1 hour
- API responses cached to reduce database load

### Rate Limiting
- 100 requests per minute per IP
- Distributed rate limiting across multiple server instances

### Distributed Locks
- Prevents double payments
- 30-second locks for payment processing
- Automatic lock expiration

## Monitoring Redis

```bash
# Monitor Redis commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# Check connected clients
redis-cli info clients

# Check slow queries
redis-cli slowlog get 10
```

## Production Configuration

For production, update `/etc/redis/redis.conf`:

```conf
# Security
requirepass your_strong_password
bind 127.0.0.1 0.0.0.0

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Performance
tcp-keepalive 300
timeout 0
```
