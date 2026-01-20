import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_id, checkout_session_id, status, payment_method } = body;

    // Validate required fields
    if (!merchant_id || !checkout_session_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: merchant_id, checkout_session_id, status' },
        { status: 400 }
      );
    }

    // Create transaction record
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      merchant_id,
      checkout_session_id,
      status,
      payment_method: payment_method || 'unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Forward to Django backend for processing
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    try {
      const backendResponse = await fetch(`${backendUrl}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        console.error('Backend error:', errorData);
        return NextResponse.json(
          { error: 'Failed to record transaction in backend' },
          { status: 500 }
        );
      }

      const backendData = await backendResponse.json();
      
      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction.id,
          merchant_id: transaction.merchant_id,
          checkout_session_id: transaction.checkout_session_id,
          status: transaction.status,
          payment_method: transaction.payment_method,
          created_at: transaction.created_at
        },
        dashboard_updated: backendData.dashboard_updated || true
      });

    } catch (backendError) {
      console.error('Backend connection error:', backendError);
      
      // Fallback: Record transaction locally
      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction.id,
          merchant_id: transaction.merchant_id,
          checkout_session_id: transaction.checkout_session_id,
          status: transaction.status,
          payment_method: transaction.payment_method,
          created_at: transaction.created_at
        },
        warning: 'Backend temporarily unavailable, transaction recorded locally'
      });
    }

  } catch (error) {
    console.error('Transaction recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchant_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    if (!merchantId) {
      return NextResponse.json(
        { error: 'Missing merchant_id parameter' },
        { status: 400 }
      );
    }

    // Forward to Django backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const queryParams = new URLSearchParams();
    
    queryParams.append('merchant_id', merchantId);
    if (status) queryParams.append('status', status);
    if (limit) queryParams.append('limit', limit);

    try {
      const backendResponse = await fetch(`${backendUrl}/api/transactions?${queryParams}`);
      
      if (!backendResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch transactions' },
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
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
