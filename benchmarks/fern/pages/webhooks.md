---
title: Webhooks
description: Receive real-time notifications about events in your Acme account using webhooks.
slug: webhooks
---

# Webhooks

Webhooks enable your application to receive real-time notifications when events occur in your Acme account. Instead of polling the API for status changes, events are pushed directly to your server.

## How webhooks work

1. You register a webhook endpoint URL in the Acme Dashboard
2. When an event occurs (e.g., a workflow completes), a POST request is sent to your URL
3. Your server processes the event and returns a 200 response
4. If the delivery fails, retries are attempted with exponential backoff

## Supported events

| Event type | Description |
|-----------|-------------|
| `processing.completed` | A data processing job finished |
| `processing.failed` | A data processing job failed |
| `resource.created` | A new resource was provisioned |
| `resource.deleted` | A resource was removed |
| `workflow.completed` | A workflow finished executing |
| `workflow.failed` | A workflow encountered an error |
| `export.ready` | A data export is ready for download |
| `subscription.updated` | Subscription plan was changed |
| `quota.warning` | Request quota approaching limit |
| `quota.exhausted` | Request quota fully consumed |

## Webhook payload

Each webhook delivery includes an event object:

```json
{
  "event_id": "evt_a1b2c3d4e5f6",
  "type": "processing.completed",
  "created_at": "2024-01-15T20:14:31.000Z",
  "data": {
    "job_id": "job_h1b2c3d4e5f6",
    "pipeline_id": "standard_v2",
    "input_size": 150,
    "status": "completed",
    "result_url": "https://api.acme.io/v1/jobs/job_h1b2c3d4e5f6/result"
  }
}
```

## Verifying webhook signatures

Always verify the webhook signature before processing events:

```typescript
import crypto from "crypto";
import express from "express";

const WEBHOOK_SECRET = process.env.ACME_WEBHOOK_SECRET!;

const app = express();

app.post(
  "/webhooks/acme",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["x-acme-signature"] as string;
    const timestamp = req.headers["x-acme-timestamp"] as string;
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
    case "processing.completed":
      await handleProcessingCompleted(event.data);
      break;
    case "workflow.completed":
      await handleWorkflowCompleted(event.data);
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
