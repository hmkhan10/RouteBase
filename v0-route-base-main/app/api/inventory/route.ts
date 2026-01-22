import { NextRequest, NextResponse } from 'next/server'
import { getRedis, RedisCacheManager } from '@/lib/redis'

const cacheManager = new RedisCacheManager()

// Mock inventory data
const mockInventory = {
  "prod-1": 10,
  "prod-2": 5,
  "prod-3": 20,
  "prod-4": 15,
  "prod-5": 2,
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (productId) {
      // Get specific product inventory
      const cached = await cacheManager.get(`inventory:${productId}`)
      if (cached !== null) {
        return NextResponse.json({ productId, stock: cached })
      }
      
      const stock = mockInventory[productId as keyof typeof mockInventory] || 0
      await cacheManager.set(`inventory:${productId}`, stock, 60) // 1 minute cache
      
      return NextResponse.json({ productId, stock })
    }
    
    // Get all inventory
    const cached = await cacheManager.get('inventory:all')
    if (cached) {
      return NextResponse.json(cached)
    }
    
    await cacheManager.set('inventory:all', mockInventory, 60) // 1 minute cache
    return NextResponse.json(mockInventory)
    
  } catch (error) {
    console.error('Inventory check error:', error)
    return NextResponse.json(
      { error: 'Failed to check inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity, action } = await request.json()
    
    if (!productId || !quantity || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get current inventory
    const currentStock = mockInventory[productId as keyof typeof mockInventory] || 0
    
    if (action === 'reserve') {
      if (currentStock < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock', available: currentStock },
          { status: 409 }
        )
      }
      
      // Reserve stock (decrement)
      mockInventory[productId as keyof typeof mockInventory] = currentStock - quantity
      
      // Invalidate cache
      await cacheManager.del(`inventory:${productId}`)
      await cacheManager.del('inventory:all')
      
      return NextResponse.json({
        success: true,
        remainingStock: mockInventory[productId as keyof typeof mockInventory]
      })
    }
    
    if (action === 'release') {
      // Release stock (increment)
      mockInventory[productId as keyof typeof mockInventory] = currentStock + quantity
      
      // Invalidate cache
      await cacheManager.del(`inventory:${productId}`)
      await cacheManager.del('inventory:all')
      
      return NextResponse.json({
        success: true,
        remainingStock: mockInventory[productId as keyof typeof mockInventory]
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Inventory update error:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}
