---
title: Troubleshooting
description: Common issues and solutions when working with the ElevenLabs API.
slug: troubleshooting
---

# Troubleshooting

This guide covers common issues encountered when integrating with the ElevenLabs API and how to resolve them.

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
curl -s https://api.elevenlabs.io/v1/user \
  -H "xi-api-key: $ELEVENLABS_API_KEY" | jq .
```

If this returns user info, your key is valid. If not, generate a new key from the Dashboard.

### "Insufficient permissions" (403)

**Symptoms:** Certain endpoints return 403 while others work.

**Causes:**
- Using a scoped API key without the required scope
- Workspace role doesn't have access to the feature
- Feature requires a higher subscription plan

**Solution:** Check that your API key has the required scopes for the endpoints you're calling. Admin keys have full access; scoped keys are limited to their defined permissions.

## Audio quality issues

### Generated speech sounds robotic

**Possible causes:**
- Stability setting too high (>0.8)
- Using an older model version
- Input text contains unusual formatting

**Solution:**
```typescript
const audio = await client.textToSpeech.convert(voiceId, {
  text: cleanedText,
  modelId: "eleven_v3", // Use the latest model
  voiceSettings: {
    stability: 0.5,        // Lower for more expression
    similarityBoost: 0.75, // Balance between clarity and expression
    style: 0.3,            // Add some stylistic variation
    useSpeakerBoost: true,
  },
});
```

### Audio has unexpected pauses or pacing

**Possible causes:**
- Punctuation issues in input text
- Very long paragraphs without breaks
- Special characters being interpreted as pauses

**Solution:** Clean your input text before sending:

```typescript
function cleanTextForTTS(text: string): string {
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

## Character quota

### "Quota exceeded" error

**Symptoms:** 429 response with `quota_exceeded` error code.

**Solution:**

```typescript
// Check remaining quota before generating
const subscription = await client.user.getSubscription();
const remaining = subscription.characterLimit - subscription.characterCount;
const resetDate = new Date(subscription.nextCharacterCountResetUnix * 1000);

console.log(`Remaining: ${remaining} characters`);
console.log(`Resets: ${resetDate.toISOString()}`);
```

**Options when quota is exhausted:**
1. Wait for the monthly reset
2. Upgrade your subscription plan
3. Purchase additional character packs (if available on your plan)

## Streaming issues

### Stream disconnects mid-generation

**Possible causes:**
- Network timeout
- Text too long for streaming
- Server-side processing error

**Solution:** Implement reconnection logic:

```typescript
async function streamWithReconnect(
  client: ElevenLabsClient,
  voiceId: string,
  text: string,
  maxRetries = 3
): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const stream = await client.textToSpeech.stream(voiceId, {
        text,
        modelId: "eleven_flash_v2_5",
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

## Voice cloning

### Cloned voice sounds different from source

**Possible causes:**
- Source audio quality is too low
- Source audio contains background noise
- Not enough source audio provided

**Best practices for source audio:**
- Use at least 30 seconds of clean audio (Professional Clone)
- Ensure minimal background noise
- Use consistent microphone placement
- Avoid audio with music or multiple speakers
- Use WAV or FLAC format for best quality

## Debugging tips

1. **Enable request logging** to see exactly what's being sent
2. **Check the response headers** for rate limit and quota information
3. **Use the History page** in the Dashboard to review recent generations
4. **Test with simple inputs first** before complex text
5. **Compare models** - try the same text with different models
6. **Check service status** at status.elevenlabs.io for outages
