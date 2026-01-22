import { NextRequest, NextResponse } from 'next/server'

// API endpoint to fetch merchant data from PostgreSQL database
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
    const mockMerchantData = {
      id: userId,
      name: userId.includes('tech') ? 'Tech Store' : 'Fashion Boutique',
      domain: userId.includes('tech') ? 'techstore.com' : 'fashionboutique.com',
      tier: userId.includes('pro') ? 'PRO' : 'FREE',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-22T17:45:00Z',
      verified_domains: [userId.includes('tech') ? 'techstore.com' : 'fashionboutique.com'],
      api_keys: [`rbk_${Math.random().toString(36).substr(2, 32)}`],
      settings: {
        currency: 'PKR',
        timezone: 'Asia/Karachi',
        notifications_enabled: true,
        fraud_detection: userId.includes('pro')
      }
    }

    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 150))

    return NextResponse.json(mockMerchantData)
    
  } catch (error) {
    console.error('Merchant Data API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
