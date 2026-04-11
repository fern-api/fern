---
title: Rate Limiting
description: Understand ElevenLabs API rate limits and how to handle them in your application.
slug: rate-limiting
---

# Rate Limiting

Rate limits ensure fair usage and platform stability. Understanding these limits helps you build reliable integrations.

## Rate limit overview

Rate limits are applied per API key and vary by subscription plan. When you exceed the limit, the API returns a `429 Too Many Requests` response.

## Default limits by plan

| Plan | Requests per second | Concurrent requests | Daily character limit |
|------|-------------------|-------------------|---------------------|
| Free | 2 RPS | 2 | 10,000 |
| Starter | 5 RPS | 5 | 30,000 |
| Creator | 10 RPS | 10 | 100,000 |
| Pro | 20 RPS | 20 | 500,000 |
| Scale | 50 RPS | 50 | 2,000,000 |
| Enterprise | Custom | Custom | Custom |

These limits are per API key. If your application uses multiple keys, each has its own rate limit allocation.

## Rate limit headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1705344000
X-CharacterCount: 5000
X-CharacterLimit: 500000
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |
| `X-CharacterCount` | Characters used in current billing period |
| `X-CharacterLimit` | Character limit for current billing period |

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
        error instanceof ElevenLabsError &&
        error.statusCode === 429
      ) {
        if (attempt === maxRetries) throw error;

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
    private refillRate: number = 20
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

const limiter = new RateLimiter(10, 10);

async function generateBatch(texts: string[]) {
  for (const text of texts) {
    await limiter.acquire();
    await client.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_flash_v2_5",
    });
  }
}
```

## Character quotas

In addition to request rate limits, the API enforces character quotas based on your subscription plan. Character usage is tracked per billing period and resets monthly.

```typescript
// Check remaining quota before generating
const subscription = await client.user.getSubscription();
const remaining = subscription.characterLimit - subscription.characterCount;

if (text.length > remaining) {
  throw new QuotaError(`Need ${text.length} chars but only ${remaining} remaining`);
}
```

## Best practices

1. **Monitor rate limit headers** to stay within limits proactively
2. **Implement exponential backoff** for automatic retry on 429 responses
3. **Use streaming endpoints** for long texts to get audio faster
4. **Batch requests intelligently** rather than sending bursts
5. **Cache generated audio** when the same text will be requested multiple times
6. **Monitor character usage** to avoid unexpected quota exhaustion
