import { NextRequest, NextResponse } from 'next/server'

// API endpoint to fetch user subscription from PostgreSQL database
export async function GET(request: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const userId = authHeader.split(' ')[1]
    
    // In production, fetch from PostgreSQL database
    // For now, simulate database response
    const mockDatabaseResponse = {
      user_id: userId,
      subscription_tier: userId.includes('pro') ? 'PRO' : 'FREE',
      plan_type: 'ecommerce',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-22T17:45:00Z',
      status: 'active',
      next_billing_date: '2024-02-15T10:30:00Z'
    }

    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 100))

    return NextResponse.json(mockDatabaseResponse)
    
  } catch (error) {
    console.error('Subscription API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update subscription tier (for payment processing)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const userId = authHeader.split(' ')[1]
    const body = await request.json()
    
    // In production, update PostgreSQL database
    // For now, simulate the update
    const updateData = {
      user_id: userId,
      subscription_tier: body.subscription_tier || 'FREE',
      plan_type: body.plan_type || 'ecommerce',
      updated_at: new Date().toISOString(),
      status: 'active'
    }

    // Simulate database update delay
    await new Promise(resolve => setTimeout(resolve, 200))

    console.log('Database Update:', updateData)

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      data: updateData
    })
    
  } catch (error) {
    console.error('Subscription Update Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
