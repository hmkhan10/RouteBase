import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_id, items, total } = body;

    // Validate required fields
    if (!merchant_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: merchant_id, items' },
        { status: 400 }
      );
    }

    // Calculate platform fee (3%) and gateway fee
    const platformFee = total * 0.03; // 3% platform fee
    const gatewayFee = total * 0.029 + 30; // ~2.9% + 30 PKR
    const merchantPayout = total - platformFee - gatewayFee;

    // Create checkout session data
    const checkoutSession = {
      id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      merchant_id,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      total,
      platform_fee: platformFee,
      gateway_fee: gatewayFee,
      merchant_payout: merchantPayout,
      currency: 'PKR',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Forward to Django backend for processing
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    try {
      const backendResponse = await fetch(`${backendUrl}/api/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutSession)
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        console.error('Backend error:', errorData);
        return NextResponse.json(
          { error: 'Failed to create checkout session in backend' },
          { status: 500 }
        );
      }

      const backendData = await backendResponse.json();
      
      // Return success response with checkout session details
      return NextResponse.json({
        success: true,
        checkout_session: {
          id: checkoutSession.id,
          total: checkoutSession.total,
          platform_fee: checkoutSession.platform_fee,
          gateway_fee: checkoutSession.gateway_fee,
          merchant_payout: checkoutSession.merchant_payout,
          currency: checkoutSession.currency,
          status: checkoutSession.status,
          checkout_url: backendData.checkout_url || `/checkout/${checkoutSession.id}`
        },
        items: checkoutSession.items
      });

    } catch (backendError) {
      console.error('Backend connection error:', backendError);
      
      // Fallback: Create session locally and return
      return NextResponse.json({
        success: true,
        checkout_session: {
          id: checkoutSession.id,
          total: checkoutSession.total,
          platform_fee: checkoutSession.platform_fee,
          gateway_fee: checkoutSession.gateway_fee,
          merchant_payout: checkoutSession.merchant_payout,
          currency: checkoutSession.currency,
          status: checkoutSession.status,
          checkout_url: `/checkout/${checkoutSession.id}`
        },
        items: checkoutSession.items,
        warning: 'Backend temporarily unavailable, session created locally'
      });
    }

  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const merchantId = searchParams.get('merchant_id');

    if (!sessionId && !merchantId) {
      return NextResponse.json(
        { error: 'Missing session_id or merchant_id parameter' },
        { status: 400 }
      );
    }

    // Forward to Django backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const queryParams = new URLSearchParams();
    
    if (sessionId) queryParams.append('session_id', sessionId);
    if (merchantId) queryParams.append('merchant_id', merchantId);

    try {
      const backendResponse = await fetch(`${backendUrl}/api/checkout/session?${queryParams}`);
      
      if (!backendResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch checkout session' },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);

    } catch (backendError) {
      console.error('Backend connection error:', backendError);
      return NextResponse.json(
        { error: 'Backend temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Checkout session fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
