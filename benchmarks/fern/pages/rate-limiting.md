---
title: Rate Limiting
description: Understand Square API rate limits and how to handle them in your application.
slug: rate-limiting
---

# Rate Limiting

Square enforces rate limits to ensure fair usage and platform stability. Understanding these limits helps you build reliable integrations.

## Rate limit overview

Square applies rate limits per application and per endpoint. When you exceed the limit, the API returns a `429 Too Many Requests` response with a `RATE_LIMIT_ERROR` category.

## Default limits

| Tier | Requests per second | Applies to |
|------|-------------------|------------|
| Standard | 20 RPS | Most endpoints |
| Payments | 30 RPS | Payments endpoints |
| Catalog | 15 RPS | Catalog batch endpoints |
| Search | 10 RPS | Search endpoints |
| OAuth | 5 RPS | OAuth token endpoints |

These limits are per-application (identified by your application ID), not per-token. If your application uses multiple merchant tokens, all requests count toward the same limit.

## Rate limit headers

Square includes rate limit information in response headers:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1705344000
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

## Handling rate limits

### Basic retry with backoff

```typescript
async function callWithRateLimit<T>(
  fn: () => Promise<T>,
  maxRetries = 5
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof SquareError &&
        error.errors.some((e) => e.category === "RATE_LIMIT_ERROR")
      ) {
        if (attempt === maxRetries) throw error;

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}
```

### Token bucket rate limiter

For proactive rate limiting, implement a token bucket:

```typescript
class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number = 20,
    private refillRate: number = 20 // tokens per second
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens <= 0) {
      const waitTime = (1 / this.refillRate) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.refill();
    }

    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + elapsed * this.refillRate
    );
    this.lastRefill = now;
  }
}

const limiter = new RateLimiter(20, 20);

async function listAllCustomers() {
  let cursor: string | undefined;
  do {
    await limiter.acquire();
    const response = await client.customers.list({ cursor });
    cursor = response.cursor;
  } while (cursor);
}
```

## Batch endpoints

For bulk operations, use batch endpoints instead of making individual requests. Batch endpoints count as a single request against the rate limit:

```typescript
// Instead of 100 individual requests:
const response = await client.catalog.batchUpsert({
  idempotencyKey: crypto.randomUUID(),
  batches: [
    {
      objects: items.map((item) => ({
        type: "ITEM",
        id: `#${item.name}`,
        itemData: {
          name: item.name,
          description: item.description,
        },
      })),
    },
  ],
});
```

## Best practices

1. **Monitor rate limit headers** to stay within limits proactively
2. **Implement exponential backoff** for automatic retry on 429 responses
3. **Use batch endpoints** when processing multiple items
4. **Spread requests over time** rather than sending bursts
5. **Cache responses** when possible to reduce API calls
6. **Use webhooks** instead of polling for real-time updates
