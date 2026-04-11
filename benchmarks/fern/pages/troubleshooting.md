---
title: Troubleshooting
description: Common issues and solutions when working with the Acme API.
slug: troubleshooting
---

# Troubleshooting

This guide covers common issues encountered when integrating with the Acme API and how to resolve them.

## Authentication errors

### "Invalid API key" (401)

**Symptoms:** All API calls return 401 Unauthorized.

**Causes:**
- API key is expired or revoked
- Using a key from a different workspace
- Extra whitespace or newline characters in the key

**Solution:**

```bash
# Verify your API key works
curl -s https://api.acme.io/v1/user \
  -H "Authorization: Bearer $ACME_API_KEY" | jq .
```

If this returns user info, your key is valid. If not, generate a new key from the Dashboard.

### "Insufficient permissions" (403)

**Symptoms:** Certain endpoints return 403 while others work.

**Causes:**
- Using a scoped API key without the required scope
- Workspace role doesn't have access to the feature
- Feature requires a higher subscription plan

**Solution:** Check that your API key has the required scopes for the endpoints you're calling. Admin keys have full access; scoped keys are limited to their defined permissions.

## Data quality issues

### Processing results are incomplete

**Possible causes:**
- Input data contains invalid encoding
- Using an older pipeline version
- Input data contains unusual formatting

**Solution:**
```typescript
const result = await client.data.process({
  input: cleanedInput,
  pipeline: "precision_v3", // Use the latest pipeline
  settings: {
    quality: 0.8,           // Higher quality setting
    enrichMetadata: true,   // Include additional context
    dedup: true,            // Remove duplicates
    validateInput: true,
  },
});
```

### Results have unexpected formatting

**Possible causes:**
- Encoding issues in input data
- Very long inputs without structure
- Special characters being misinterpreted

**Solution:** Clean your input data before sending:

```typescript
function cleanInput(text: string): string {
  return text
    .replace(/\s+/g, " ")           // Normalize whitespace
    .replace(/\.{2,}/g, ".")         // Collapse multiple periods
    .replace(/[^\w\s.,!?;:'"()-]/g, "") // Remove special characters
    .trim();
}
```

## Rate limiting

### Hitting rate limits frequently

**Symptoms:** Frequent 429 responses, especially during batch processing.

**Solution:** Implement a request queue with concurrency control:

```typescript
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) return;
    this.running++;
    const task = this.queue.shift()!;
    await task();
    this.running--;
    this.processQueue();
  }
}

const queue = new RequestQueue(5); // Max 5 concurrent requests
```

## Request quota

### "Quota exceeded" error

**Symptoms:** 429 response with `quota_exceeded` error code.

**Solution:**

```typescript
// Check remaining quota before processing
const subscription = await client.user.getSubscription();
const remaining = subscription.requestLimit - subscription.requestCount;
const resetDate = new Date(subscription.nextResetTimestamp);

console.log(`Remaining: ${remaining} requests`);
console.log(`Resets: ${resetDate.toISOString()}`);
```

**Options when quota is exhausted:**
1. Wait for the monthly reset
2. Upgrade your subscription plan
3. Purchase additional request packs (if available on your plan)

## Streaming issues

### Stream disconnects mid-processing

**Possible causes:**
- Network timeout
- Input too large for streaming
- Server-side processing error

**Solution:** Implement reconnection logic:

```typescript
async function streamWithReconnect(
  client: AcmeClient,
  input: string,
  maxRetries = 3
): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const stream = await client.data.stream({
        input,
        pipeline: "standard_v2",
      });

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      return Buffer.concat(chunks);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      console.warn(`Stream attempt ${attempt + 1} failed, retrying...`);
      chunks.length = 0; // Reset chunks for retry
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  throw new Error("Unreachable");
}
```

## Resource provisioning

### Resource creation times out

**Possible causes:**
- Resource type requires extended provisioning
- Region capacity constraints
- Dependent resources not yet available

**Best practices for resource provisioning:**
- Use async provisioning with webhook callbacks for large resources
- Set appropriate timeouts (5+ minutes for databases)
- Implement polling with exponential backoff
- Monitor resource status via the Dashboard
- Use pre-provisioned resource pools for latency-sensitive workloads

## Debugging tips

1. **Enable request logging** to see exactly what's being sent
2. **Check the response headers** for rate limit and quota information
3. **Use the Activity page** in the Dashboard to review recent requests
4. **Test with simple inputs first** before complex data
5. **Compare pipelines** - try the same input with different pipelines
6. **Check service status** at status.acme.io for outages
