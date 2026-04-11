---
title: Error Handling
description: Handle Square API errors gracefully with proper error categories, codes, and retry strategies.
slug: error-handling
---

# Error Handling

The Square API returns structured error responses that help you diagnose and handle failures. This guide covers error categories, common error codes, and recommended retry strategies.

## Error response structure

All error responses follow the same format:

```json
{
  "errors": [
    {
      "category": "INVALID_REQUEST_ERROR",
      "code": "MISSING_REQUIRED_PARAMETER",
      "detail": "Missing required parameter: `source_id`",
      "field": "source_id"
    }
  ]
}
```

A single response may contain multiple errors if several validation failures occurred.

## Error categories

| Category | HTTP status | Description | Retryable? |
|----------|-------------|-------------|------------|
| `API_ERROR` | 500 | Internal server error | Yes, with backoff |
| `AUTHENTICATION_ERROR` | 401 | Invalid or expired token | No (refresh token first) |
| `INVALID_REQUEST_ERROR` | 400 | Malformed request | No (fix the request) |
| `RATE_LIMIT_ERROR` | 429 | Too many requests | Yes, after delay |
| `PAYMENT_METHOD_ERROR` | 402 | Payment was declined | No (use different payment) |
| `REFUND_ERROR` | 400 | Refund cannot be processed | Depends on code |
| `MERCHANT_SUBSCRIPTION_ERROR` | 403 | Feature not available on plan | No |

## Common error codes

### Payment errors

| Code | Description | Resolution |
|------|-------------|------------|
| `CARD_DECLINED` | The card was declined | Ask customer for a different card |
| `CARD_EXPIRED` | The card has expired | Ask customer for a valid card |
| `INSUFFICIENT_FUNDS` | Not enough balance | Ask customer for a different card |
| `CVV_FAILURE` | CVV verification failed | Ask customer to re-enter CVV |
| `ADDRESS_VERIFICATION_FAILURE` | AVS check failed | Verify billing address |
| `INVALID_CARD` | Card number is invalid | Check card number for typos |
| `CARD_TOKEN_EXPIRED` | Payment token has expired | Generate a new token |

### Request errors

| Code | Description | Resolution |
|------|-------------|------------|
| `MISSING_REQUIRED_PARAMETER` | A required field is missing | Check API docs for required fields |
| `INVALID_VALUE` | A field has an invalid value | Validate input before sending |
| `VALUE_TOO_LOW` | Amount is below minimum | Check minimum amount for currency |
| `VALUE_TOO_HIGH` | Amount exceeds maximum | Check maximum amount limits |
| `IDEMPOTENCY_KEY_REUSED` | Key used for a different request | Generate a new idempotency key |

## Handling errors in code

```typescript
import { SquareClient, SquareError } from "square";

async function processPayment(sourceId: string, amount: number) {
  try {
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(amount),
        currency: "USD",
      },
    });
    return response.payment;
  } catch (error) {
    if (error instanceof SquareError) {
      for (const e of error.errors) {
        console.error(`[${e.category}] ${e.code}: ${e.detail}`);

        switch (e.category) {
          case "RATE_LIMIT_ERROR":
            // Wait and retry
            await sleep(1000);
            return processPayment(sourceId, amount);
          case "PAYMENT_METHOD_ERROR":
            // Don't retry - payment method issue
            throw new PaymentDeclinedError(e.detail);
          case "API_ERROR":
            // Retry with exponential backoff
            throw new RetryableError(e.detail);
          default:
            throw error;
        }
      }
    }
    throw error;
  }
}
```

## Retry strategy

For retryable errors, use exponential backoff with jitter:

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      if (error instanceof SquareError) {
        const isRetryable = error.errors.some(
          (e) =>
            e.category === "API_ERROR" || e.category === "RATE_LIMIT_ERROR"
        );
        if (!isRetryable) throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * delay * 0.1;
      await sleep(delay + jitter);
    }
  }
  throw new Error("Unreachable");
}
```

## HTTP status code reference

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (check error details) |
| 401 | Unauthorized (check token) |
| 403 | Forbidden (check permissions/scopes) |
| 404 | Resource not found |
| 409 | Conflict (resource already exists) |
| 422 | Unprocessable entity |
| 429 | Rate limited (slow down) |
| 500 | Internal server error (retry) |
