import { NextRequest, NextResponse } from 'next/server'
import { getRedis, RedisLockManager, RedisCacheManager } from '@/lib/redis'

const lockManager = new RedisLockManager()
const cacheManager = new RedisCacheManager()

export async function POST(request: NextRequest) {
  try {
    const { sessionId, items, totalAmount } = await request.json()
    
    if (!sessionId || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Acquire distributed lock for this session to prevent double payments
    const lockKey = `payment:${sessionId}`
    const lockValue = await lockManager.acquireLock(lockKey, 30) // 30 second lock
    
    if (!lockValue) {
      return NextResponse.json(
        { error: 'Payment already in progress' },
        { status: 429 }
      )
    }
    
    try {
      // Check if payment was already processed
      const existingPayment = await cacheManager.get(`payment:${sessionId}`)
      if (existingPayment) {
        return NextResponse.json(
          { error: 'Payment already processed' },
          { status: 409 }
        )
      }
      
      // Simulate payment processing with random delays and failures
      const processingTime = Math.random() * 2000 + 500 // 500-2500ms
      const shouldFail = Math.random() < 0.1 // 10% failure rate
      
      await new Promise(resolve => setTimeout(resolve, processingTime))
      
      if (shouldFail) {
        throw new Error('Payment processing failed')
      }
      
      // Generate payment ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Store payment result in cache
      const paymentResult = {
        id: paymentId,
        sessionId,
        items,
        totalAmount,
        status: 'completed',
        processedAt: new Date().toISOString(),
        processingTime
      }
      
      await cacheManager.set(`payment:${sessionId}`, paymentResult, 3600) // 1 hour cache
      
      // Release lock
      await lockManager.releaseLock(lockKey, lockValue)
      
      return NextResponse.json({
        success: true,
        paymentId,
        message: 'Payment processed successfully',
        processingTime
      })
      
    } catch (error) {
      // Ensure lock is released even on error
      await lockManager.releaseLock(lockKey, lockValue)
      throw error
    }
    
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    // Check payment status
    const payment = await cacheManager.get(`payment:${sessionId}`)
    
    if (!payment) {
      return NextResponse.json(
        { status: 'not_found', message: 'No payment found for this session' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(payment)
    
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
