const http = require('http');
const { performance } = require('perf_hooks');

class LoadTestRunner {
  constructor(baseUrl, redisUrl) {
    this.baseUrl = baseUrl || process.env.TARGET_URL || 'http://localhost:3000';
    this.redisUrl = redisUrl || process.env.REDIS_HOST || 'redis';
    this.results = {
      startTime: null,
      endTime: null,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      errors: [],
      paymentTests: [],
      doublePaymentTests: []
    };
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const postData = data ? JSON.stringify(data) : null;
      const options = {
        hostname: new URL(this.baseUrl).hostname,
        port: new URL(this.baseUrl).port || 80,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RouteBases-LoadTester/1.0'
        }
      };

      if (postData) {
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          try {
            const parsedBody = JSON.parse(body);
            resolve({
              statusCode: res.statusCode,
              responseTime,
              data: parsedBody,
              success: res.statusCode >= 200 && res.statusCode < 300
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              responseTime,
              data: body,
              success: res.statusCode >= 200 && res.statusCode < 300
            });
          }
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        reject({
          error: error.message,
          responseTime,
          success: false
        });
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  async simulateUser(userId, requestsPerUser = 5) {
    const sessionId = `test_session_${userId}_${Date.now()}_${Math.random()}`;
    const userResults = [];

    for (let i = 0; i < requestsPerUser; i++) {
      try {
        // Random delay between requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

        const operations = [
          () => this.cartOperation(sessionId, userId),
          () => this.paymentOperation(sessionId, userId),
          () => this.inventoryOperation()
        ];

        const randomOp = operations[Math.floor(Math.random() * operations.length)];
        const result = await randomOp();
        userResults.push(result);

        this.results.totalRequests++;
        if (result.success) {
          this.results.successfulRequests++;
        } else {
          this.results.failedRequests++;
          this.results.errors.push(result.error || `Request failed: ${result.statusCode}`);
        }
      } catch (error) {
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push(error.error || error.message);
      }
    }

    return userResults;
  }

  async cartOperation(sessionId, userId) {
    const data = {
      sessionId,
      action: 'add',
      itemId: `prod-${(userId % 5) + 1}`,
      quantity: Math.floor(Math.random() * 3) + 1
    };

    const result = await this.makeRequest('/api/cart', 'POST', data);
    return { ...result, type: 'cart', userId, sessionId };
  }

  async paymentOperation(sessionId, userId) {
    const data = {
      sessionId,
      items: [{ productId: `prod-${(userId % 5) + 1}`, quantity: 1 }],
      totalAmount: Math.floor(Math.random() * 50000) + 1000
    };

    const result = await this.makeRequest('/api/payments', 'POST', data);
    if (result.success) {
      this.results.paymentTests.push(result);
    }
    return { ...result, type: 'payment', userId, sessionId };
  }

  async inventoryOperation() {
    const productId = `prod-${Math.floor(Math.random() * 5) + 1}`;
    const result = await this.makeRequest(`/api/inventory?productId=${productId}`, 'GET');
    return { ...result, type: 'inventory', productId };
  }

  async doublePaymentTest(sessionId) {
    console.log(`Starting double payment test for session: ${sessionId}`);
    
    const paymentData = {
      sessionId,
      items: [{ productId: 'prod-1', quantity: 1 }],
      totalAmount: 12999
    };

    // Fire two payment requests simultaneously
    const [payment1, payment2] = await Promise.allSettled([
      this.makeRequest('/api/payments', 'POST', paymentData),
      this.makeRequest('/api/payments', 'POST', paymentData)
    ]);

    const result1 = payment1.status === 'fulfilled' ? payment1.value : { error: 'Request failed' };
    const result2 = payment2.status === 'fulfilled' ? payment2.value : { error: 'Request failed' };

    const testResult = {
      sessionId,
      payment1: result1,
      payment2: result2,
      bothSuccessful: result1.success && result2.success,
      bothSamePayment: result1.data?.paymentId === result2.data?.paymentId,
      doublePaymentDetected: result1.success && result2.success && result1.data?.paymentId !== result2.data?.paymentId,
      testPassed: !(result1.success && result2.success) || result1.data?.paymentId === result2.data?.paymentId
    };

    this.results.doublePaymentTests.push(testResult);
    return testResult;
  }

  async runLoadTest(concurrentUsers = 10, requestsPerUser = 5) {
    console.log(`Starting load test: ${concurrentUsers} users, ${requestsPerUser} requests each`);
    this.results.startTime = new Date().toISOString();

    const startTime = performance.now();
    const promises = [];

    // Simulate concurrent users
    for (let user = 0; user < concurrentUsers; user++) {
      promises.push(this.simulateUser(user, requestsPerUser));
    }

    // Wait for all users to complete
    await Promise.all(promises);
    
    const endTime = performance.now();
    this.results.endTime = new Date().toISOString();
    this.results.averageResponseTime = (endTime - startTime) / this.results.totalRequests;

    return this.results;
  }

  async runDoublePaymentTests(testCount = 5) {
    console.log(`Starting ${testCount} double payment tests`);
    
    for (let i = 0; i < testCount; i++) {
      const sessionId = `double_pay_test_${i}_${Date.now()}_${Math.random()}`;
      await this.doublePaymentTest(sessionId);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.results.doublePaymentTests;
  }

  printResults() {
    console.log('\n=== LOAD TEST RESULTS ===');
    console.log(`Start Time: ${this.results.startTime}`);
    console.log(`End Time: ${this.results.endTime}`);
    console.log(`Total Requests: ${this.results.totalRequests}`);
    console.log(`Successful: ${this.results.successfulRequests}`);
    console.log(`Failed: ${this.results.failedRequests}`);
    console.log(`Success Rate: ${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2)}%`);
    console.log(`Average Response Time: ${this.results.averageResponseTime.toFixed(2)}ms`);
    
    if (this.results.errors.length > 0) {
      console.log('\nErrors:');
      this.results.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    console.log('\n=== PAYMENT TESTS ===');
    console.log(`Payment Operations: ${this.results.paymentTests.length}`);
    this.results.paymentTests.slice(0, 5).forEach((test, index) => {
      console.log(`${index + 1}. Payment ID: ${test.data?.paymentId}, Response Time: ${test.responseTime.toFixed(2)}ms`);
    });

    console.log('\n=== DOUBLE PAYMENT TESTS ===');
    const passedTests = this.results.doublePaymentTests.filter(test => test.testPassed).length;
    const failedTests = this.results.doublePaymentTests.length - passedTests;
    console.log(`Total Tests: ${this.results.doublePaymentTests.length}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Double Payments Detected: ${this.results.doublePaymentTests.filter(test => test.doublePaymentDetected).length}`);

    this.results.doublePaymentTests.forEach((test, index) => {
      console.log(`Test ${index + 1}: ${test.testPassed ? 'PASSED' : 'FAILED'} - Double Payment: ${test.doublePaymentDetected}`);
    });
  }
}

// Main execution
async function main() {
  const loadTester = new LoadTestRunner();
  
  try {
    // Wait a bit for the app to start
    console.log('Waiting for application to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Run load test
    const loadTestResults = await loadTester.runLoadTest(20, 10); // 20 users, 10 requests each
    
    // Run double payment tests
    await loadTester.runDoublePaymentTests(10); // 10 double payment tests
    
    // Print results
    loadTester.printResults();
    
    // Exit with appropriate code
    const hasDoublePayments = loadTester.results.doublePaymentTests.some(test => test.doublePaymentDetected);
    process.exit(hasDoublePayments ? 1 : 0);
    
  } catch (error) {
    console.error('Load test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = LoadTestRunner;
