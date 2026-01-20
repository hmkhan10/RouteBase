import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchant_id');
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

    if (!merchantId) {
      return NextResponse.json(
        { error: 'Missing merchant_id parameter' },
        { status: 400 }
      );
    }

    // Forward to Django backend for dashboard stats
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const queryParams = new URLSearchParams();
    
    queryParams.append('merchant_id', merchantId);
    queryParams.append('period', period);

    try {
      const backendResponse = await fetch(`${backendUrl}/api/dashboard/stats?${queryParams}`);
      
      if (!backendResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch dashboard stats' },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);

    } catch (backendError) {
      console.error('Backend connection error:', backendError);
      
      // Fallback: Return mock data for development
      const mockStats = {
        total_revenue: 125000,
        total_orders: 156,
        average_order_value: 801.28,
        platform_fee_total: 3750,
        merchant_payout_total: 121250,
        recent_transactions: [
          {
            id: 'txn_001',
            amount: 2500,
            status: 'completed',
            created_at: new Date().toISOString()
          },
          {
            id: 'txn_002', 
            amount: 1800,
            status: 'completed',
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        revenue_chart: [
          { date: '2024-01-01', revenue: 5000 },
          { date: '2024-01-02', revenue: 7500 },
          { date: '2024-01-03', revenue: 6200 },
          { date: '2024-01-04', revenue: 8900 },
          { date: '2024-01-05', revenue: 11200 }
        ],
        warning: 'Backend temporarily unavailable, showing mock data'
      };

      return NextResponse.json(mockStats);
    }

  } catch (error) {
    console.error('Dashboard stats fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
