---
title: Best Practices
description: Best practices for building reliable and performant ElevenLabs API integrations.
slug: best-practices
---

# Best Practices

Follow these best practices to build reliable, secure, and performant integrations with the ElevenLabs API.

## Security

### Protect your credentials

- **Never hardcode API keys** in source code or commit them to version control
- **Use environment variables** or a secrets manager for all credentials
- **Rotate keys regularly** and revoke unused keys
- **Use service account keys** for production workloads instead of personal keys

### Handle sensitive data carefully

- **Enable zero retention mode** for sensitive content by setting `enable_logging=false`
- **Never log audio content** from voice cloning or private text-to-speech requests
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

      if (error instanceof ElevenLabsError) {
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
  const audio = await client.textToSpeech.convert(voiceId, request);
} catch (error) {
  if (error instanceof ElevenLabsError) {
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

### Monitor character quota

```typescript
async function checkQuotaBeforeGeneration(textLength: number) {
  const subscription = await client.user.getSubscription();
  const remaining = subscription.characterLimit - subscription.characterCount;

  if (textLength > remaining) {
    throw new QuotaError(
      `Need ${textLength} chars but only ${remaining} remaining. ` +
      `Quota resets on ${subscription.nextCharacterCountResetUnix}.`
    );
  }
}
```

## Performance

### Choose the right model

| Use case | Recommended model | Why |
|----------|------------------|-----|
| Real-time chat | Flash v2.5 | Lowest latency (~75ms) |
| Audiobooks | Multilingual v2 | Most consistent long-form |
| Dramatic content | Eleven v3 | Most expressive delivery |
| English-only | English v2 | Optimized for English |
| Budget-conscious | Flash v2.5 | 50% lower price per character |

### Use streaming for long texts

Streaming returns audio chunks as they're generated, reducing time-to-first-byte:

```typescript
// Non-streaming: waits for entire audio to generate
const audio = await client.textToSpeech.convert(voiceId, { text, modelId });

// Streaming: starts playing immediately
const stream = await client.textToSpeech.stream(voiceId, { text, modelId });
for await (const chunk of stream) {
  outputStream.write(chunk);
}
```

### Cache generated audio

Cache audio for repeated requests to reduce API calls and character usage:

| Content type | Recommended TTL | Invalidation |
|-------------|----------------|--------------|
| Static content (docs, help) | 24 hours | On content change |
| Dynamic content (names) | 1 hour | On data change |
| Real-time (chat) | No cache | N/A |

### Split long texts intelligently

When text exceeds the model's character limit, split at natural boundaries:

```typescript
function splitText(text: string, maxChars: number): string[] {
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
| Generation latency (p95) | 95th percentile response time | > 10s |
| Character usage | Daily character consumption | > 80% of quota |
| Rate limit hits | Number of 429 responses | > 10/minute |
| Cache hit rate | Percentage of cached responses | < 50% |
