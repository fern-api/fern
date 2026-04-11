---
title: Best Practices
description: Best practices for building reliable and performant Acme API integrations.
slug: best-practices
---

# Best Practices

Follow these best practices to build reliable, secure, and performant integrations with the Acme API.

## Security

### Protect your credentials

- **Never hardcode API keys** in source code or commit them to version control
- **Use environment variables** or a secrets manager for all credentials
- **Rotate keys regularly** and revoke unused keys
- **Use service account keys** for production workloads instead of personal keys

### Handle sensitive data carefully

- **Enable zero retention mode** for sensitive content by setting `enable_logging=false`
- **Never log request payloads** containing private or sensitive data
- **Mask API keys in logs** - show only the last 4 characters
- **Audit API key usage** regularly via the Dashboard

## Reliability

### Implement retry logic

Every API call should handle transient failures with exponential backoff:

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

      if (error instanceof AcmeError) {
        const isRetryable = [408, 429, 500, 503].includes(error.statusCode);
        if (!isRetryable) throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * delay * 0.1;
      await new Promise((r) => setTimeout(r, delay + jitter));
    }
  }
  throw new Error("Unreachable");
}
```

### Handle all error categories

```typescript
try {
  const result = await client.data.process(request);
} catch (error) {
  if (error instanceof AcmeError) {
    switch (error.statusCode) {
      case 401:
        // Invalid API key - check credentials
        break;
      case 403:
        // Insufficient permissions or plan limit
        break;
      case 422:
        // Validation error - fix the request
        break;
      case 429:
        // Rate limited - wait and retry
        break;
      case 500:
      case 503:
        // Server error - retry with backoff
        break;
    }
  }
}
```

### Monitor request quota

```typescript
async function checkQuotaBeforeProcessing(batchSize: number) {
  const subscription = await client.user.getSubscription();
  const remaining = subscription.requestLimit - subscription.requestCount;

  if (batchSize > remaining) {
    throw new QuotaError(
      `Need ${batchSize} requests but only ${remaining} remaining. ` +
      `Quota resets on ${subscription.nextResetTimestamp}.`
    );
  }
}
```

## Performance

### Choose the right pipeline

| Use case | Recommended pipeline | Why |
|----------|---------------------|-----|
| Real-time queries | Express v1 | Lowest latency |
| Batch analytics | Standard v2 | Most consistent throughput |
| Compliance reports | Precision v3 | Highest accuracy |
| English-only | Legacy v1 | Optimized for English |
| Budget-conscious | Express v1 | 50% lower cost per request |

### Use streaming for large datasets

Streaming returns results as they're generated, reducing time-to-first-byte:

```typescript
// Non-streaming: waits for entire result
const result = await client.data.process({ input, pipeline });

// Streaming: starts returning immediately
const stream = await client.data.stream({ input, pipeline });
for await (const chunk of stream) {
  outputStream.write(chunk);
}
```

### Cache results

Cache responses for repeated requests to reduce API calls and quota usage:

| Content type | Recommended TTL | Invalidation |
|-------------|----------------|--------------|
| Static lookups (config, schema) | 24 hours | On config change |
| Dynamic queries (search, filter) | 1 hour | On data change |
| Real-time (monitoring) | No cache | N/A |

### Split large inputs intelligently

When input exceeds the pipeline's size limit, split at natural boundaries:

```typescript
function splitInput(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split("\n\n");
  let current = "";

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length > maxChars) {
      if (current) chunks.push(current.trim());
      current = paragraph;
    } else {
      current += (current ? "\n\n" : "") + paragraph;
    }
  }
  if (current) chunks.push(current.trim());

  return chunks;
}
```

## Monitoring

### Track key metrics

| Metric | Description | Alert threshold |
|--------|-------------|-----------------|
| API error rate | Percentage of failed API calls | > 1% |
| Processing latency (p95) | 95th percentile response time | > 10s |
| Request usage | Daily request consumption | > 80% of quota |
| Rate limit hits | Number of 429 responses | > 10/minute |
| Cache hit rate | Percentage of cached responses | < 50% |
