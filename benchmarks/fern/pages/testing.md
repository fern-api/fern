---
title: Testing
slug: testing
description: Test your integration using sandbox mode and test credentials.
---

# Testing

The Acme API provides a sandbox environment for testing your integration without affecting production data or incurring charges.

## Sandbox vs Production

| Feature | Sandbox | Production |
|---------|---------|------------|
| Base URL | `https://sandbox.acme.com/v1` | `https://api.acme.com/v1` |
| API Keys | Prefixed with `sk_test_` | Prefixed with `sk_live_` |
| Data | Isolated test data | Real customer data |
| Rate Limits | 100 req/min | Based on plan |
| Webhooks | Simulated events | Real events |

## Getting Started

Create a sandbox API key from your dashboard. Sandbox keys can only access the sandbox environment and will be rejected by production endpoints.

```bash
# Sandbox request
curl https://sandbox.acme.com/v1/orders \
  -H "Authorization: Bearer sk_test_abc123"
```

## Test Data

The sandbox comes pre-populated with test resources you can use:

### Test Credit Cards

| Number | Brand | Behavior |
|--------|-------|----------|
| 4242 4242 4242 4242 | Visa | Succeeds |
| 4000 0000 0000 0002 | Visa | Declines |
| 5555 5555 5555 4444 | Mastercard | Succeeds |
| 3782 822463 10005 | Amex | Succeeds |

### Test Addresses

Use ZIP code `00000` to trigger address validation failures. All other ZIP codes pass validation.

## Simulating Scenarios

### Trigger Specific Errors

Use special values to simulate error conditions:

```python
import acme

client = acme.Client(
    api_key="sk_test_abc123",
    base_url="https://sandbox.acme.com/v1"
)

# Simulate insufficient funds
try:
    order = client.orders.create(
        amount=999999,  # Triggers insufficient_funds in sandbox
        currency="usd"
    )
except acme.PaymentError as e:
    print(f"Expected error: {e.code}")
```

### Simulate Webhooks

Trigger webhook events without waiting for real events to occur:

```bash
curl -X POST https://sandbox.acme.com/v1/webhooks/simulate \
  -H "Authorization: Bearer sk_test_abc123" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "order.completed", "resource_id": "order_test_123"}'
```

## Clock Control

The sandbox supports time manipulation for testing time-dependent features like subscription renewals and trial expirations.

```bash
# Advance sandbox clock by 30 days
curl -X POST https://sandbox.acme.com/v1/test/clock/advance \
  -H "Authorization: Bearer sk_test_abc123" \
  -d '{"days": 30}'
```

## Resetting Sandbox Data

Clear all test data and start fresh:

```bash
curl -X POST https://sandbox.acme.com/v1/test/reset \
  -H "Authorization: Bearer sk_test_abc123"
```

This deletes all resources created in the sandbox. Pre-populated test data is restored automatically.
