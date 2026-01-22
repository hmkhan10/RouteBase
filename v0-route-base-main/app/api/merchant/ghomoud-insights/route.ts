import { NextRequest, NextResponse } from 'next/server'

// Ghomoud AI Insights API - LLM-powered business intelligence
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

    const merchantId = authHeader.split(' ')[1]
    
    // In production, fetch last 50 transactions from PostgreSQL
    // and process with LLM for business insights
    const mockTransactions = [
      { id: 1, amount: 2500, status: 'completed', device: 'mobile', created_at: '2024-01-22T14:30:00Z' },
      { id: 2, amount: 1200, status: 'failed', device: 'desktop', created_at: '2024-01-22T15:15:00Z' },
      { id: 3, amount: 5800, status: 'completed', device: 'mobile', created_at: '2024-01-22T16:45:00Z' },
      { id: 4, amount: 3200, status: 'completed', device: 'tablet', created_at: '2024-01-22T18:20:00Z' },
      { id: 5, amount: 900, status: 'abandoned', device: 'mobile', created_at: '2024-01-22T19:10:00Z' },
      // ... more transactions
    ]

    // Simulate LLM processing
    const insights = await generateLLMInsights(mockTransactions, merchantId)
    
    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({
      merchant_id: merchantId,
      analysis_period: 'last_50_transactions',
      insights_generated: insights.length,
      insights,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Ghomoud Insights API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Simulate LLM-powered insight generation
async function generateLLMInsights(transactions: any[], merchantId: string) {
  // In production, this would call a real LLM (GPT-4, Claude, etc.)
  // For now, simulate AI-generated insights based on transaction patterns
  
  const completedTransactions = transactions.filter(t => t.status === 'completed')
  const failedTransactions = transactions.filter(t => t.status === 'failed')
  const abandonedTransactions = transactions.filter(t => t.status === 'abandoned')
  const mobileTransactions = transactions.filter(t => t.device === 'mobile')
  const highValueTransactions = transactions.filter(t => t.amount > 5000)
  
  const insights = []

  // Conversion Rate Analysis
  const conversionRate = (completedTransactions.length / transactions.length) * 100
  if (conversionRate < 70) {
    insights.push({
      type: 'warning',
      title: 'Low Conversion Rate Detected',
      description: `Your conversion rate is ${conversionRate.toFixed(1)}%. Consider optimizing your checkout process to reduce friction.`,
      impact: conversionRate < 50 ? 'high' : 'medium',
      actionable: true,
      suggested_action: 'Optimize Checkout Flow'
    })
  }

  // Mobile Performance
  const mobileConversionRate = (mobileTransactions.filter(t => t.status === 'completed').length / mobileTransactions.length) * 100
  if (mobileConversionRate > 80) {
    insights.push({
      type: 'opportunity',
      title: 'Strong Mobile Performance',
      description: `Mobile conversion rate is ${mobileConversionRate.toFixed(1)}%. Consider increasing mobile ad spend.`,
      impact: 'medium',
      actionable: true,
      suggested_action: 'Increase Mobile Ad Budget'
    })
  }

  // High-Value Transaction Analysis
  if (highValueTransactions.length > 0) {
    insights.push({
      type: 'recommendation',
      title: 'High-Value Customer Opportunity',
      description: `${highValueTransactions.length} transactions exceeded PKR 5,000. Implement premium customer support for these users.`,
      impact: 'high',
      actionable: true,
      suggested_action: 'Setup VIP Support'
    })
  }

  // Failed Payment Pattern
  if (failedTransactions.length > transactions.length * 0.1) {
    insights.push({
      type: 'warning',
      title: 'Payment Failure Pattern',
      description: `${failedTransactions.length} payments failed. Check your payment gateway configuration and error handling.`,
      impact: 'high',
      actionable: true,
      suggested_action: 'Review Payment Gateway'
    })
  }

  // Cart Abandonment
  if (abandonedTransactions.length > 0) {
    const avgAbandonedValue = abandonedTransactions.reduce((sum, t) => sum + t.amount, 0) / abandonedTransactions.length
    insights.push({
      type: 'opportunity',
      title: 'Cart Recovery Opportunity',
      description: `${abandonedTransactions.length} carts abandoned with average value PKR ${avgAbandonedValue.toFixed(0)}. Implement email recovery sequence.`,
      impact: avgAbandonedValue > 3000 ? 'high' : 'medium',
      actionable: true,
      suggested_action: 'Setup Recovery Emails'
    })
  }

  // Peak Time Analysis (simulated)
  insights.push({
    type: 'trend',
    title: 'Peak Shopping Hours Identified',
    description: 'Most transactions occur between 6-9 PM. Schedule marketing campaigns during these hours for maximum impact.',
    impact: 'medium',
    actionable: true,
    suggested_action: 'Schedule Evening Campaigns'
  })

  // Device Usage Trend
  const mobileUsageRate = (mobileTransactions.length / transactions.length) * 100
  if (mobileUsageRate > 60) {
    insights.push({
      type: 'trend',
      title: 'Mobile-First Customer Base',
      description: `${mobileUsageRate.toFixed(1)}% of your customers use mobile devices. Ensure mobile experience is fully optimized.`,
      impact: 'medium',
      actionable: false
    })
  }

  return insights.slice(0, 6) // Return top 6 insights
}

// POST endpoint for manual insight generation
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const merchantId = authHeader.split(' ')[1]
    const body = await request.json()
    
    // Generate insights for specific time period or criteria
    const customInsights = await generateLLMInsights([], merchantId) // Empty array for demo
    
    return NextResponse.json({
      message: 'Custom insights generated successfully',
      insights: customInsights,
      criteria: body.criteria || 'default'
    })
    
  } catch (error) {
    console.error('Custom Insights Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
