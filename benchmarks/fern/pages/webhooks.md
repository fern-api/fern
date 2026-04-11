---
title: Webhooks
description: Receive real-time notifications about events in your ElevenLabs account using webhooks.
slug: webhooks
---

# Webhooks

Webhooks enable your application to receive real-time notifications when events occur in your ElevenLabs account. Instead of polling the API for status changes, events are pushed directly to your server.

## How webhooks work

1. You register a webhook endpoint URL in the ElevenLabs Dashboard
2. When an event occurs (e.g., a dubbing job completes), a POST request is sent to your URL
3. Your server processes the event and returns a 200 response
4. If the delivery fails, retries are attempted with exponential backoff

## Supported events

| Event type | Description |
|-----------|-------------|
| `text_to_speech.completed` | A text-to-speech generation finished |
| `text_to_speech.failed` | A text-to-speech generation failed |
| `voice_clone.completed` | A voice clone was successfully created |
| `voice_clone.failed` | A voice clone processing failed |
| `dubbing.completed` | A dubbing project finished rendering |
| `dubbing.failed` | A dubbing project encountered an error |
| `pronunciation_dictionary.updated` | A dictionary was modified |
| `subscription.updated` | Subscription plan was changed |
| `quota.warning` | Character quota approaching limit |
| `quota.exhausted` | Character quota fully consumed |

## Webhook payload

Each webhook delivery includes an event object:

```json
{
  "event_id": "evt_a1b2c3d4e5f6",
  "type": "text_to_speech.completed",
  "created_at": "2024-01-15T20:14:31.000Z",
  "data": {
    "history_item_id": "h1b2c3d4e5f6",
    "voice_id": "JBFqnCBsd6RMkjVDRZzb",
    "model_id": "eleven_flash_v2_5",
    "character_count": 150,
    "status": "completed",
    "audio_url": "https://api.elevenlabs.io/v1/history/h1b2c3d4e5f6/audio"
  }
}
```

## Verifying webhook signatures

Always verify the webhook signature before processing events:

```typescript
import crypto from "crypto";
import express from "express";

const WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET!;

const app = express();

app.post(
  "/webhooks/elevenlabs",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["x-elevenlabs-signature"] as string;
    const timestamp = req.headers["x-elevenlabs-timestamp"] as string;
    const body = req.body.toString();

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(`${timestamp}.${body}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return res.status(403).send("Invalid signature");
    }

    const event = JSON.parse(body);
    console.log(`Received event: ${event.type}`);

    processEvent(event).catch(console.error);

    res.status(200).send("OK");
  }
);
```

## Handling webhook events

```typescript
async function processEvent(event: WebhookEvent) {
  if (await isEventProcessed(event.event_id)) {
    return;
  }

  switch (event.type) {
    case "text_to_speech.completed":
      await handleTTSCompleted(event.data);
      break;
    case "dubbing.completed":
      await handleDubbingCompleted(event.data);
      break;
    case "quota.warning":
      await handleQuotaWarning(event.data);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  await markEventProcessed(event.event_id);
}
```

## Retry behavior

If your endpoint does not return a 200 response, retries are attempted:

| Attempt | Delay after previous attempt |
|---------|------------------------------|
| 1st retry | ~60 seconds |
| 2nd retry | ~120 seconds |
| 3rd retry | ~360 seconds |
| 4th retry | ~1200 seconds |
| 5th retry | ~3600 seconds |

After 6 total attempts (1 initial + 5 retries), the event is marked as failed.

## Best practices

1. **Respond quickly** - Return 200 before doing heavy processing
2. **Implement idempotency** - Events may be delivered more than once
3. **Verify signatures** - Always validate the HMAC signature
4. **Use HTTPS** - Webhook URLs must use HTTPS
5. **Handle event ordering** - Events may arrive out of order
6. **Log everything** - Store raw event payloads for debugging
7. **Set up alerting** - Monitor for failed deliveries
