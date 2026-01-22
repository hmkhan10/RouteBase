#!/bin/bash

# RouteBase Platform Load Testing Script
echo "🚀 Starting RouteBase Platform Load Testing..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to check service health
check_health() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Checking $service_name health..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is healthy!"
            return 0
        fi
        
        echo "⏳ Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to become healthy after $max_attempts attempts"
    return 1
}

# Function to run load test
run_load_test() {
    echo "🔄 Starting load test with $1 concurrent users and $2 requests per user..."
    
    curl -X POST http://localhost:3000/api/load-test \
        -H "Content-Type: application/json" \
        -d "{
            \"concurrentUsers\": $1,
            \"requestsPerUser\": $2,
            \"testType\": \"mixed\",
            \"delay\": 50
        }" | jq '.' > load-test-results.json
    
    echo "📊 Load test completed. Results saved to load-test-results.json"
}

# Function to run double payment test
run_double_payment_test() {
    echo "🔄 Starting double payment test..."
    
    for i in {1..10}; do
        echo "🔄 Double payment test $i/10..."
        session_id="test_session_$(date +%s)_$RANDOM"
        
        curl -X PUT http://localhost:3000/api/load-test \
            -H "Content-Type: application/json" \
            -d "{\"sessionId\": \"$session_id\"}" | jq '.' >> double-payment-results.json
        
        sleep 1
    done
    
    echo "📊 Double payment tests completed. Results saved to double-payment-results.json"
}

# Function to stress test Redis
stress_test_redis() {
    echo "🔄 Starting Redis stress test..."
    
    # Install redis-cli if not present
    if ! command -v redis-cli &> /dev/null; then
        echo "📦 Installing redis-tools..."
        sudo apt-get update && sudo apt-get install -y redis-tools
    fi
    
    # Run redis-benchmark
    redis-benchmark -h localhost -p 6379 -c 50 -n 10000 -d 100 -q > redis-stress-test.txt
    
    echo "📊 Redis stress test completed. Results saved to redis-stress-test.txt"
}

# Function to monitor system resources
monitor_resources() {
    echo "📊 Starting system resource monitoring..."
    
    # Monitor CPU, Memory, and Redis usage
    (
        echo "Timestamp,CPU_Usage,Memory_Usage,Redis_Memory,Redis_Clients"
        for i in {1..60}; do
            timestamp=$(date '+%Y-%m-%d %H:%M:%S')
            cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
            memory_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
            redis_memory=$(redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
            redis_clients=$(redis-cli info clients | grep connected_clients | cut -d: -f2 | tr -d '\r')
            echo "$timestamp,$cpu_usage,$memory_usage,$redis_memory,$redis_clients"
            sleep 1
        done
    ) > system-monitoring.csv
    
    echo "📊 System monitoring completed. Results saved to system-monitoring.csv"
}

# Main execution
main() {
    echo "🐳 Starting Docker services..."
    docker-compose up -d redis app
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    if ! check_health "Redis" "http://localhost:6379"; then
        echo "❌ Redis health check failed"
        exit 1
    fi
    
    if ! check_health "Application" "http://localhost:3000/api/health"; then
        echo "❌ Application health check failed"
        exit 1
    fi
    
    echo "✅ All services are healthy!"
    
    # Create results directory
    mkdir -p test-results
    cd test-results
    
    # Run different types of tests
    echo "🧪 Running comprehensive test suite..."
    
    # 1. Light load test
    run_load_test 10 5
    
    # 2. Medium load test
    run_load_test 50 10
    
    # 3. Heavy load test
    run_load_test 100 20
    
    # 4. Double payment tests
    run_double_payment_test
    
    # 5. Redis stress test
    stress_test_redis
    
    # 6. System monitoring (run in background)
    monitor_resources &
    MONITOR_PID=$!
    
    # Wait for monitoring to complete
    wait $MONITOR_PID
    
    echo "🎉 All tests completed!"
    echo "📁 Results saved in test-results/ directory"
    
    # Generate summary report
    echo "📊 Generating summary report..."
    cat > test-summary.md << EOF
# RouteBase Load Test Summary

## Test Configuration
- **Platform**: RouteBase Fintech Marketplace
- **Date**: $(date)
- **Environment**: Docker Compose
- **Redis**: localhost:6379
- **Application**: localhost:3000

## Test Results

### Load Tests
- **Light Load**: 10 concurrent users, 5 requests each
- **Medium Load**: 50 concurrent users, 10 requests each  
- **Heavy Load**: 100 concurrent users, 20 requests each

### Double Payment Tests
- **Tests Run**: 10 concurrent payment attempts
- **Expected**: Only one payment should succeed per session

### System Performance
- **CPU Usage**: Monitored during tests
- **Memory Usage**: Tracked throughout execution
- **Redis Performance**: Benchmark results available

## Files Generated
- \`load-test-results.json\` - Detailed load test results
- \`double-payment-results.json\` - Double payment test outcomes
- \`redis-stress-test.txt\` - Redis performance metrics
- \`system-monitoring.csv\` - Resource usage over time

## Analysis
Review the generated files to identify:
1. Performance bottlenecks
2. Double payment vulnerabilities
3. Redis capacity limits
4. System resource constraints

EOF
    
    echo "📄 Summary report generated: test-summary.md"
    
    # Cleanup
    echo "🧹 Cleaning up..."
    docker-compose down
    
    echo "✅ Load testing completed successfully!"
}

# Run main function
main "$@"
