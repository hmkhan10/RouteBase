import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const redis = await import('@/lib/redis').then(m => m.getRedis())
    
    // Test Redis connection
    await redis.ping()
    
    // Get basic stats
    const info = await redis.info('memory')
    const memoryUsed = info.split('\r\n')
      .find(line => line.startsWith('used_memory_human:'))
      ?.split(':')[1] || 'unknown'
    
    const clients = await redis.info('clients')
    const connectedClients = clients.split('\r\n')
      .find(line => line.startsWith('connected_clients:'))
      ?.split(':')[1] || 'unknown'
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      redis: {
        connected: true,
        memoryUsed,
        connectedClients
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
