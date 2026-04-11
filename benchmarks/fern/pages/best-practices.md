---
title: Best Practices
description: Best practices for building reliable and performant Square API integrations.
slug: best-practices
---

# Best Practices

Follow these best practices to build reliable, secure, and performant integrations with the Square API.

## Security

### Protect your credentials

- **Never hardcode tokens** in source code or commit them to version control
- **Use environment variables** or a secrets manager for all credentials
- **Rotate tokens regularly** and revoke unused tokens
- **Use minimum required scopes** for OAuth applications

### Validate webhook signatures

Always verify the HMAC-SHA256 signature before processing webhook events. Never trust webhook data without verification.

### Handle sensitive data carefully

- **Never log full card numbers** or sensitive payment data
- **Mask tokens in logs** - show only the last 4 characters
- **Use PCI-compliant hosting** for payment processing
- **Encrypt data at rest** in your database

## Reliability

### Implement idempotency

Every write request should include an `idempotency_key`. Use a deterministic key when possible:

```typescript
// Good: deterministic key based on business logic
const idempotencyKey = `order-${orderId}-payment-${attemptNumber}`;

// Acceptable: UUID for one-time operations
const idempotencyKey = crypto.randomUUID();

// Bad: no idempotency key (request may be duplicated on retry)
```

### Handle all error categories

```typescript
try {
  const result = await client.payments.create(request);
} catch (error) {
  if (error instanceof SquareError) {
    for (const e of error.errors) {
      switch (e.category) {
        case "AUTHENTICATION_ERROR":
          // Refresh token or alert admin
          break;
        case "INVALID_REQUEST_ERROR":
          // Fix the request (don't retry)
          break;
        case "RATE_LIMIT_ERROR":
          // Wait and retry with backoff
          break;
        case "PAYMENT_METHOD_ERROR":
          // Ask customer for different payment
          break;
        case "API_ERROR":
          // Retry with exponential backoff
          break;
      }
    }
  }
}
```

### Implement retry logic

Use exponential backoff with jitter for retryable errors:

| Attempt | Base delay | With jitter |
|---------|-----------|-------------|
| 1 | 1s | 0.9-1.1s |
| 2 | 2s | 1.8-2.2s |
| 3 | 4s | 3.6-4.4s |
| 4 | 8s | 7.2-8.8s |
| 5 | 16s | 14.4-17.6s |

## Performance

### Use batch endpoints

Batch operations are more efficient than individual requests:

```typescript
// Instead of 50 individual catalog updates:
await client.catalog.batchUpsert({
  idempotencyKey: crypto.randomUUID(),
  batches: [{ objects: catalogItems }],
});
```

### Cache frequently accessed data

Cache data that changes infrequently:

| Data | Recommended TTL | Invalidation |
|------|----------------|--------------|
| Locations | 1 hour | Manual refresh |
| Catalog items | 15 minutes | Webhook: `catalog.version.updated` |
| Customer profiles | 5 minutes | Webhook: `customer.updated` |
| Team members | 30 minutes | Manual refresh |

### Use webhooks instead of polling

Webhooks provide real-time updates without the overhead of continuous polling:

```typescript
// Bad: polling every 30 seconds
setInterval(async () => {
  const payments = await client.payments.list({
    beginTime: lastCheck.toISOString(),
  });
  // Process new payments...
}, 30000);

// Good: webhook handler
app.post("/webhooks/square", (req, res) => {
  const event = verifyAndParse(req);
  if (event.type === "payment.completed") {
    processPayment(event.data.object.payment);
  }
  res.sendStatus(200);
});
```

## Testing

### Use the sandbox environment

- Test all payment flows in sandbox before production
- Use test card numbers to simulate different scenarios
- Verify error handling with decline and failure cards
- Test webhook handling with sandbox events

### Write integration tests

```typescript
describe("Payment processing", () => {
  it("should process a successful payment", async () => {
    const result = await processPayment({
      sourceId: "cnon:card-nonce-ok",
      amount: 1000,
      currency: "USD",
    });

    expect(result.status).toBe("COMPLETED");
    expect(result.amountMoney.amount).toBe(1000n);
  });

  it("should handle a declined card", async () => {
    await expect(
      processPayment({
        sourceId: "cnon:card-nonce-declined",
        amount: 1000,
        currency: "USD",
      })
    ).rejects.toThrow("CARD_DECLINED");
  });
});
```

## Monitoring

### Track key metrics

| Metric | Description | Alert threshold |
|--------|-------------|-----------------|
| API error rate | Percentage of failed API calls | > 1% |
| Payment success rate | Percentage of successful payments | < 95% |
| API latency (p95) | 95th percentile response time | > 5s |
| Webhook delivery rate | Percentage of successful webhook deliveries | < 99% |
| Token refresh failures | Failed OAuth token refreshes | Any failure |
