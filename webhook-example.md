# RouteBase Webhook Integration Guide

## Overview

RouteBase webhooks allow you to receive real-time notifications about payment events in your application. When an event occurs, we'll send a POST request to your configured webhook URL with event data.

## Security

### Webhook Signature Verification

Each webhook request includes an `X-Webhook-Signature` header containing an HMAC-SHA256 signature. You should verify this signature to ensure the request is authentic.

```python
import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    """Verify webhook signature"""
    payload_str = json.dumps(payload, sort_keys=True)
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)
```

## Event Types

### payment.completed
Sent when a payment is successfully processed.

```json
{
  "event_type": "payment.completed",
  "data": {
    "order_id": "12345",
    "amount": "1000.00",
    "currency": "PKR",
    "customer_email": "customer@example.com",
    "payment_method": "credit_card",
    "timestamp": "2025-01-22T10:30:00Z"
  }
}
```

### payment.failed
Sent when a payment fails.

```json
{
  "event_type": "payment.failed",
  "data": {
    "order_id": "12346",
    "amount": "1000.00",
    "currency": "PKR",
    "error_code": "insufficient_funds",
    "error_message": "Insufficient funds in customer account",
    "timestamp": "2025-01-22T10:31:00Z"
  }
}
```

### refund.processed
Sent when a refund is successfully processed.

```json
{
  "event_type": "refund.processed",
  "data": {
    "refund_id": "RF-ABC12345",
    "order_id": "12345",
    "amount": "500.00",
    "currency": "PKR",
    "reason": "Customer requested refund",
    "processor": "routebase",
    "timestamp": "2025-01-22T10:32:00Z"
  }
}
```

### refund.failed
Sent when a refund fails.

```json
{
  "event_type": "refund.failed",
  "data": {
    "refund_id": "RF-ABC12346",
    "order_id": "12346",
    "amount": "500.00",
    "currency": "PKR",
    "error_code": "refund_period_expired",
    "error_message": "Refund period has expired",
    "timestamp": "2025-01-22T10:33:00Z"
  }
}
```

### payout.created
Sent when a payout request is created.

```json
{
  "event_type": "payout.created",
  "data": {
    "payout_id": "PO-DEF67890",
    "merchant_id": "user123",
    "amount": "10000.00",
    "net_amount": "9200.00",
    "platform_fee": "300.00",
    "tax_withheld": "500.00",
    "payout_method": "bank_transfer",
    "timestamp": "2025-01-22T10:34:00Z"
  }
}
```

### payout.completed
Sent when a payout is successfully completed.

```json
{
  "event_type": "payout.completed",
  "data": {
    "payout_id": "PO-DEF67890",
    "merchant_id": "user123",
    "amount": "10000.00",
    "net_amount": "9200.00",
    "bank_reference": "BANK123456",
    "timestamp": "2025-01-22T10:35:00Z"
  }
}
```

### payout.failed
Sent when a payout fails.

```json
{
  "event_type": "payout.failed",
  "data": {
    "payout_id": "PO-DEF67891",
    "merchant_id": "user123",
    "amount": "10000.00",
    "error_code": "bank_account_invalid",
    "error_message": "Invalid bank account details",
    "timestamp": "2025-01-22T10:36:00Z"
  }
}
```

## Implementation Examples

### Node.js (Express)

```javascript
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Your webhook secret from RouteBase dashboard
const WEBHOOK_SECRET = 'wh_your_webhook_secret_here';

function verifySignature(payload, signature) {
  const payloadStr = JSON.stringify(payload, null, 2);
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payloadStr)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  // Verify signature
  if (!verifySignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process event
  const eventType = payload.event_type;
  
  switch (eventType) {
    case 'payment.completed':
      // Handle successful payment
      console.log('Payment completed:', payload.data);
      // Update order status, send confirmation email, etc.
      break;
      
    case 'payment.failed':
      // Handle failed payment
      console.log('Payment failed:', payload.data);
      // Notify customer, update order status, etc.
      break;
      
    case 'refund.processed':
      // Handle processed refund
      console.log('Refund processed:', payload.data);
      // Update refund status, notify customer, etc.
      break;
      
    // Handle other event types...
  }
  
  res.status(200).json({ received: true });
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Python (Flask)

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)

# Your webhook secret from RouteBase dashboard
WEBHOOK_SECRET = 'wh_your_webhook_secret_here'

def verify_signature(payload, signature):
    """Verify webhook signature"""
    payload_str = json.dumps(payload, sort_keys=True)
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_json()
    
    # Verify signature
    if not verify_signature(payload, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Process event
    event_type = payload.get('event_type')
    
    if event_type == 'payment.completed':
        # Handle successful payment
        print(f"Payment completed: {payload['data']}")
        # Update order status, send confirmation email, etc.
        
    elif event_type == 'payment.failed':
        # Handle failed payment
        print(f"Payment failed: {payload['data']}")
        # Notify customer, update order status, etc.
        
    elif event_type == 'refund.processed':
        # Handle processed refund
        print(f"Refund processed: {payload['data']}")
        # Update refund status, notify customer, etc.
    
    # Handle other event types...
    
    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(port=3000)
```

### PHP

```php
<?php
// Your webhook secret from RouteBase dashboard
define('WEBHOOK_SECRET', 'wh_your_webhook_secret_here');

function verifySignature($payload, $signature) {
    $payloadStr = json_encode($payload, JSON_PRETTY_PRINT);
    $expectedSignature = hash_hmac('sha256', $payloadStr, WEBHOOK_SECRET);
    
    return hash_equals($expectedSignature, $signature);
}

// Get webhook data
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$payload = json_decode(file_get_contents('php://input'), true);

// Verify signature
if (!verifySignature($payload, $signature)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// Process event
$eventType = $payload['event_type'] ?? '';

switch ($eventType) {
    case 'payment.completed':
        // Handle successful payment
        error_log("Payment completed: " . json_encode($payload['data']));
        // Update order status, send confirmation email, etc.
        break;
        
    case 'payment.failed':
        // Handle failed payment
        error_log("Payment failed: " . json_encode($payload['data']));
        // Notify customer, update order status, etc.
        break;
        
    case 'refund.processed':
        // Handle processed refund
        error_log("Refund processed: " . json_encode($payload['data']));
        // Update refund status, notify customer, etc.
        break;
        
    // Handle other event types...
}

http_response_code(200);
echo json_encode(['received' => true]);
?>
```

## Best Practices

1. **Always verify signatures** - Never trust incoming webhook requests without signature verification
2. **Use HTTPS** - Always use HTTPS URLs for your webhook endpoints
3. **Return 200 quickly** - Respond quickly to avoid timeouts and retries
4. **Handle duplicates** - Webhooks may be sent multiple times, use event IDs to deduplicate
5. **Log everything** - Keep detailed logs of webhook events for debugging
6. **Monitor failures** - Check webhook delivery logs in your RouteBase dashboard
7. **Use idempotent operations** - Design your handlers to safely process duplicate events

## Testing

Use the "Test Webhook" feature in your RouteBase dashboard to send test events to your webhook URL. This helps you verify your implementation before going live.

## Support

If you need help with webhook integration, contact our support team at support@routebase.com
