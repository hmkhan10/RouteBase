import { NextRequest, NextResponse } from 'next/server'
import { getRedis, RedisSessionManager } from '@/lib/redis'

const sessionManager = new RedisSessionManager()

export async function POST(request: NextRequest) {
  try {
    const { sessionId, action, itemId, quantity } = await request.json()
    
    if (!sessionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get session data
    let sessionData = await sessionManager.getSession(sessionId)
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    // Initialize cart if not exists
    if (!sessionData.cartItems) {
      sessionData.cartItems = []
    }
    
    switch (action) {
      case 'add':
        if (!itemId || !quantity) {
          return NextResponse.json(
            { error: 'Item ID and quantity required' },
            { status: 400 }
          )
        }
        
        const existingItemIndex = sessionData.cartItems.findIndex((item: any) => item.productId === itemId)
        
        if (existingItemIndex >= 0) {
          sessionData.cartItems[existingItemIndex].quantity += quantity
        } else {
          sessionData.cartItems.push({
            productId: itemId,
            quantity,
            addedAt: new Date().toISOString()
          })
        }
        break
        
      case 'remove':
        if (!itemId) {
          return NextResponse.json(
            { error: 'Item ID required' },
            { status: 400 }
          )
        }
        
        sessionData.cartItems = sessionData.cartItems.filter((item: any) => item.productId !== itemId)
        break
        
      case 'update':
        if (!itemId || !quantity) {
          return NextResponse.json(
            { error: 'Item ID and quantity required' },
            { status: 400 }
          )
        }
        
        const itemIndex = sessionData.cartItems.findIndex((item: any) => item.productId === itemId)
        if (itemIndex >= 0) {
          sessionData.cartItems[itemIndex].quantity = quantity
        }
        break
        
      case 'clear':
        sessionData.cartItems = []
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    // Update session
    await sessionManager.updateSession(sessionId, { cartItems: sessionData.cartItems })
    
    return NextResponse.json({
      success: true,
      cartItems: sessionData.cartItems,
      totalItems: sessionData.cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
    })
    
  } catch (error) {
    console.error('Cart operation error:', error)
    return NextResponse.json(
      { error: 'Cart operation failed' },
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
    
    const sessionData = await sessionManager.getSession(sessionId)
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      cartItems: sessionData.cartItems || [],
      totalItems: (sessionData.cartItems || []).reduce((sum: number, item: any) => sum + item.quantity, 0)
    })
    
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}
