---
title: Troubleshooting
description: Common issues and solutions when working with the Square API.
slug: troubleshooting
---

# Troubleshooting

This guide covers common issues you might encounter when working with the Square API and how to resolve them.

## Authentication issues

### "UNAUTHORIZED" error (401)

**Symptoms**: API returns `401` with `AUTHENTICATION_ERROR` category.

**Common causes**:
1. **Expired access token** - OAuth tokens expire after 30 days
2. **Wrong environment** - Using a sandbox token in production or vice versa
3. **Revoked token** - Token was revoked in the Developer Dashboard
4. **Missing Bearer prefix** - Authorization header must be `Bearer YOUR_TOKEN`

**Solutions**:

```typescript
// Check token format
const headers = {
  Authorization: `Bearer ${token}`, // Must include "Bearer " prefix
};

// Check environment matches token
const client = new SquareClient({
  token: sandboxToken,
  environment: "sandbox", // Must match token type
});

// Refresh expired OAuth tokens
if (error.category === "AUTHENTICATION_ERROR") {
  const newToken = await refreshOAuthToken(merchantId);
  // Retry with new token
}
```

### OAuth token refresh fails

**Symptoms**: `obtainToken` with `grant_type: refresh_token` returns an error.

**Common causes**:
- Refresh token has been revoked
- Application credentials have changed
- Merchant has deauthorized your application

**Solution**: Direct the merchant to re-authorize your application through the OAuth flow.

## Payment issues

### "CARD_DECLINED" error

**Symptoms**: Payment creation fails with `PAYMENT_METHOD_ERROR` category and `CARD_DECLINED` code.

**Common causes**:
- Insufficient funds
- Card issuer declined the transaction
- Card is blocked or frozen

**Solutions**:
1. Ask the customer to try a different payment method
2. Verify the card details are correct
3. Suggest the customer contact their card issuer

### "IDEMPOTENCY_KEY_REUSED" error

**Symptoms**: `INVALID_REQUEST_ERROR` with code `IDEMPOTENCY_KEY_REUSED`.

**Cause**: The same idempotency key was used for a different request body.

**Solution**: Generate a unique idempotency key for each distinct operation:

```typescript
// Each unique operation needs its own key
const key1 = crypto.randomUUID(); // For payment 1
const key2 = crypto.randomUUID(); // For payment 2

// Retries of the same operation should use the SAME key
const retryKey = `payment-${orderId}`; // Same key for retries
```

### Payment amount is wrong

**Symptoms**: Customer is charged a different amount than expected.

**Cause**: Amount is in the smallest currency unit (cents), not dollars.

```typescript
// Wrong: $10.00 creates a $1000.00 charge
{ amount: 1000, currency: "USD" } // This is $10.00

// Wrong: charging 10 cents instead of $10.00
{ amount: 10, currency: "USD" } // This is $0.10

// Correct: $10.00
{ amount: 1000, currency: "USD" } // 1000 cents = $10.00
```

## Webhook issues

### Webhooks not being received

**Checklist**:
1. Verify the webhook URL is correct in the Developer Dashboard
2. Ensure the URL is publicly accessible (not localhost)
3. Check that the URL uses HTTPS
4. Verify the server returns 200 within 10 seconds
5. Check the webhook subscription is enabled for the event type
6. Review the Developer Dashboard for delivery attempts and errors

### Signature verification fails

**Common causes**:
1. Using the wrong signature key (check Developer Dashboard)
2. Body was modified before verification (use raw body)
3. Notification URL doesn't match the registered URL exactly

```typescript
// Make sure to use the raw body, not parsed JSON
app.post(
  "/webhooks",
  express.raw({ type: "application/json" }), // Raw body
  (req, res) => {
    const rawBody = req.body.toString(); // String, not parsed
    const isValid = verifySignature(rawBody, req.headers);
  }
);
```

## Rate limiting issues

### Frequent 429 responses

**Solutions**:
1. Implement request queuing with rate limiting
2. Use batch endpoints for bulk operations
3. Cache responses to reduce API calls
4. Use webhooks instead of polling

### Identifying rate limit source

```typescript
// Check rate limit headers
const remaining = response.headers["x-ratelimit-remaining"];
const resetTime = response.headers["x-ratelimit-reset"];

if (Number(remaining) < 5) {
  console.warn(
    `Rate limit nearly exhausted. Resets at ${new Date(
      Number(resetTime) * 1000
    )}`
  );
}
```

## SDK issues

### TypeScript BigInt serialization

**Symptoms**: `TypeError: Do not know how to serialize a BigInt`

**Cause**: `JSON.stringify` doesn't support BigInt natively.

**Solution**:
```typescript
// Use a custom serializer
JSON.stringify(data, (key, value) =>
  typeof value === "bigint" ? value.toString() : value
);
```

### Python SDK version conflicts

**Symptoms**: Import errors or unexpected behavior after upgrade.

**Solution**:
```bash
# Clean install
pip uninstall squareup
pip install squareup==35.0.0
```

## Debugging tips

1. **Enable verbose logging** in your SDK client
2. **Check the Developer Dashboard** for API call logs
3. **Use the API Explorer** to test requests manually
4. **Compare sandbox vs production** behavior
5. **Check the Square Status Page** for outages
6. **Review webhook delivery logs** in the Dashboard
