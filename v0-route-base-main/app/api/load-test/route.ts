import { NextRequest, NextResponse } from 'next/server'

// Load testing simulation endpoint
export async function POST(request: NextRequest) {
  try {
    const { 
      concurrentUsers = 10, 
      requestsPerUser = 5, 
      testType = 'mixed',
      delay = 100 
    } = await request.json()
    
    const results: {
      startTime: string;
      endTime: string | null;
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      averageResponseTime: number;
      errors: string[];
      concurrentPayments: any[];
    } = {
      startTime: new Date().toISOString(),
      endTime: null,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      errors: [] as string[],
      concurrentPayments: [] as any[]
    }
    
    console.log(`Starting load test: ${concurrentUsers} users, ${requestsPerUser} requests each`)
    
    const startTime = Date.now()
    const promises: Promise<any>[] = []
    
    // Simulate concurrent users
    for (let user = 0; user < concurrentUsers; user++) {
      const userPromises = []
      
      for (let req = 0; req < requestsPerUser; req++) {
        userPromises.push(
          simulateUserRequest(user, req, testType, delay)
            .then(result => {
              results.totalRequests++
              if (result.success) {
                results.successfulRequests++
              } else {
                results.failedRequests++
                results.errors.push(result.error)
              }
              return result
            })
            .catch(error => {
              results.totalRequests++
              results.failedRequests++
              results.errors.push(error.message)
              return { success: false, error: error.message }
            })
        )
      }
      
      promises.push(Promise.all(userPromises))
    }
    
    // Wait for all requests to complete
    const allResults = await Promise.all(promises)
    const endTime = Date.now()
    
    results.endTime = new Date().toISOString()
    results.averageResponseTime = (endTime - startTime) / results.totalRequests
    
    // Extract concurrent payment results
    results.concurrentPayments = allResults.flat().filter(r => r.type === 'payment')
    
    console.log(`Load test completed: ${results.successfulRequests}/${results.totalRequests} successful`)
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Load test error:', error)
    return NextResponse.json(
      { error: 'Load test failed' },
      { status: 500 }
    )
  }
}

async function simulateUserRequest(userId: number, requestId: number, testType: string, delay: number) {
  const sessionId = `test_session_${userId}_${Date.now()}`
  
  try {
    // Add random delay to simulate real user behavior
    await new Promise(resolve => setTimeout(resolve, Math.random() * delay))
    
    switch (testType) {
      case 'cart':
        return await simulateCartOperation(sessionId, userId)
      case 'payment':
        return await simulatePayment(sessionId, userId)
      case 'inventory':
        return await simulateInventoryCheck()
      case 'mixed':
      default:
        const operations = [simulateCartOperation, simulatePayment, simulateInventoryCheck]
        const randomOp = operations[Math.floor(Math.random() * operations.length)]
        return await randomOp(sessionId, userId)
    }
  } catch (error) {
    throw error
  }
}

async function simulateCartOperation(sessionId: string, userId: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  const response = await fetch(`${baseUrl}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      action: 'add',
      itemId: `prod-${(userId % 5) + 1}`,
      quantity: Math.floor(Math.random() * 3) + 1
    })
  })
  
  const data = await response.json()
  return { 
    type: 'cart', 
    success: response.ok, 
    userId, 
    sessionId,
    data,
    error: response.ok ? null : data.error 
  }
}

async function simulatePayment(sessionId: string, userId: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  const response = await fetch(`${baseUrl}/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      items: [{ productId: `prod-${(userId % 5) + 1}`, quantity: 1 }],
      totalAmount: Math.floor(Math.random() * 50000) + 1000
    })
  })
  
  const data = await response.json()
  return { 
    type: 'payment', 
    success: response.ok, 
    userId, 
    sessionId,
    paymentId: data.paymentId,
    data,
    error: response.ok ? null : data.error 
  }
}

async function simulateInventoryCheck() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const productId = `prod-${Math.floor(Math.random() * 5) + 1}`
  
  const response = await fetch(`${baseUrl}/api/inventory?productId=${productId}`)
  const data = await response.json()
  
  return { 
    type: 'inventory', 
    success: response.ok, 
    productId,
    data,
    error: response.ok ? null : data.error 
  }
}

// Double payment test endpoint
export async function PUT(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    console.log(`Starting double payment test for session: ${sessionId}`)
    
    // Simulate two simultaneous payment attempts
    const paymentData = {
      sessionId,
      items: [{ productId: 'prod-1', quantity: 1 }],
      totalAmount: 12999
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // Fire two payment requests simultaneously
    const [payment1, payment2] = await Promise.allSettled([
      fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      }),
      fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })
    ])
    
    const result1 = payment1.status === 'fulfilled' ? await payment1.value.json() : { error: 'Request failed' }
    const result2 = payment2.status === 'fulfilled' ? await payment2.value.json() : { error: 'Request failed' }
    
    // Check if double payment occurred
    const bothSuccessful = result1.success && result2.success
    const bothSamePayment = result1.paymentId === result2.paymentId
    
    return NextResponse.json({
      sessionId,
      doublePaymentTest: {
        payment1: result1,
        payment2: result2,
        bothSuccessful,
        bothSamePayment,
        doublePaymentDetected: bothSuccessful && !bothSamePayment,
        testPassed: !bothSuccessful || bothSamePayment
      }
    })
    
  } catch (error) {
    console.error('Double payment test error:', error)
    return NextResponse.json(
      { error: 'Double payment test failed' },
      { status: 500 }
    )
  }
}
