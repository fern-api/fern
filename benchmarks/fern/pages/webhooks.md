---
title: Webhooks
description: Receive real-time notifications about events in your Square account using webhooks.
slug: webhooks
---

# Webhooks

Webhooks enable your application to receive real-time notifications when events occur in a Square account. Instead of polling the API for changes, Square pushes event data to your server.

## How webhooks work

1. You register a webhook endpoint URL in the Square Developer Dashboard
2. When an event occurs (e.g., a payment is completed), Square sends an HTTP POST to your URL
3. Your server processes the event and returns a 200 response
4. If the delivery fails, Square retries with exponential backoff

## Supported events

| Event type | Description |
|-----------|-------------|
| `payment.created` | A payment was initiated |
| `payment.updated` | A payment status changed |
| `payment.completed` | A payment was completed successfully |
| `order.created` | A new order was created |
| `order.updated` | An order was modified |
| `order.fulfillment.updated` | An order fulfillment status changed |
| `customer.created` | A new customer was created |
| `customer.updated` | A customer profile was updated |
| `customer.deleted` | A customer was deleted |
| `inventory.count.updated` | Inventory count changed |
| `catalog.version.updated` | Catalog was modified |
| `invoice.created` | An invoice was created |
| `invoice.payment_made` | A payment was made on an invoice |
| `refund.created` | A refund was initiated |
| `refund.updated` | A refund status changed |
| `subscription.created` | A subscription was created |
| `subscription.updated` | A subscription was modified |

## Webhook payload

Each webhook delivery includes an event object:

```json
{
  "merchant_id": "MLBZ0YGVR7BT1",
  "type": "payment.completed",
  "event_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2024-01-15T20:14:31.000Z",
  "data": {
    "type": "payment",
    "id": "R2B3Z8WMVt3EAmzYWLZvz7Y69EbZY",
    "object": {
      "payment": {
        "id": "R2B3Z8WMVt3EAmzYWLZvz7Y69EbZY",
        "amount_money": {
          "amount": 1000,
          "currency": "USD"
        },
        "status": "COMPLETED",
        "source_type": "CARD"
      }
    }
  }
}
```

## Verifying webhook signatures

Always verify the webhook signature before processing events:

```typescript
import crypto from "crypto";
import express from "express";

const WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
const WEBHOOK_URL = "https://example.com/webhooks/square";

const app = express();

app.post(
  "/webhooks/square",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["x-square-hmacsha256-signature"] as string;
    const body = req.body.toString();

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SIGNATURE_KEY)
      .update(WEBHOOK_URL + body)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return res.status(403).send("Invalid signature");
    }

    const event = JSON.parse(body);
    console.log(`Received event: ${event.type}`);

    // Process the event asynchronously
    processEvent(event).catch(console.error);

    // Always respond quickly with 200
    res.status(200).send("OK");
  }
);
```

## Handling webhook events

```typescript
async function processEvent(event: WebhookEvent) {
  // Deduplicate by event_id
  if (await isEventProcessed(event.event_id)) {
    return;
  }

  switch (event.type) {
    case "payment.completed":
      await handlePaymentCompleted(event.data.object.payment);
      break;
    case "order.updated":
      await handleOrderUpdated(event.data.object.order);
      break;
    case "customer.created":
      await handleCustomerCreated(event.data.object.customer);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  await markEventProcessed(event.event_id);
}
```

## Retry behavior

If your endpoint does not return a 200 response, Square retries the delivery:

| Attempt | Delay after previous attempt |
|---------|------------------------------|
| 1st retry | ~60 seconds |
| 2nd retry | ~120 seconds |
| 3rd retry | ~360 seconds |
| 4th retry | ~1200 seconds |
| 5th retry | ~3600 seconds |

After 6 total attempts (1 initial + 5 retries), the event is marked as failed. Events are available in the Developer Dashboard for manual inspection.

## Best practices

1. **Respond quickly** - Return 200 before doing heavy processing
2. **Implement idempotency** - Events may be delivered more than once
3. **Verify signatures** - Always validate the HMAC signature
4. **Use HTTPS** - Webhook URLs must use HTTPS
5. **Handle event ordering** - Events may arrive out of order
6. **Log everything** - Store raw event payloads for debugging
7. **Set up alerting** - Monitor for failed deliveries
