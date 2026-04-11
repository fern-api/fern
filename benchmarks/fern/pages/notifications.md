---
title: Notifications
slug: notifications
description: Configure email, SMS, and push notifications for events.
---

# Notifications

The Acme API provides a notification system for alerting your users about important events. Configure delivery channels, templates, and preferences programmatically.

## Sending a Notification

```bash
curl -X POST https://api.acme.com/v1/notifications \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "user_abc",
    "template": "order_shipped",
    "channels": ["email", "push"],
    "data": {
      "order_id": "order_123",
      "tracking_number": "1Z999AA10123456784",
      "estimated_delivery": "2025-03-20"
    }
  }'
```

## Delivery Channels

| Channel | Configuration | Latency |
|---------|--------------|---------|
| Email | Recipient email address | Seconds |
| SMS | Phone number in E.164 format | Seconds |
| Push | Device token (FCM/APNs) | Milliseconds |
| In-App | User ID | Milliseconds |
| Slack | Webhook URL or channel ID | Seconds |

## Templates

Create reusable notification templates with variable substitution:

```bash
curl -X POST https://api.acme.com/v1/notification-templates \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "order_shipped",
    "channels": {
      "email": {
        "subject": "Your order {{order_id}} has shipped!",
        "body_html": "<h1>Good news!</h1><p>Your order is on its way. Track it with: {{tracking_number}}</p>",
        "body_text": "Your order {{order_id}} has shipped! Tracking: {{tracking_number}}"
      },
      "push": {
        "title": "Order Shipped",
        "body": "Your order is on its way! Estimated delivery: {{estimated_delivery}}"
      }
    }
  }'
```

## User Preferences

Let users control which notifications they receive:

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Get user preferences
prefs = client.notifications.get_preferences("user_abc")

# Update preferences
client.notifications.update_preferences("user_abc", {
    "order_shipped": {"email": True, "push": True, "sms": False},
    "promotional": {"email": False, "push": False, "sms": False},
    "security_alert": {"email": True, "push": True, "sms": True}
})
```

## Delivery Status

Track the delivery status of sent notifications:

```bash
curl "https://api.acme.com/v1/notifications/notif_xyz/status" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "id": "notif_xyz",
  "status": "delivered",
  "channels": [
    {"channel": "email", "status": "delivered", "delivered_at": "2025-03-15T10:00:05Z"},
    {"channel": "push", "status": "delivered", "delivered_at": "2025-03-15T10:00:01Z"}
  ]
}
```

## Batch Notifications

Send notifications to multiple recipients at once:

```bash
curl -X POST https://api.acme.com/v1/notifications/batch \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "template": "maintenance_notice",
    "recipient_ids": ["user_1", "user_2", "user_3"],
    "channels": ["email", "in_app"],
    "data": {
      "maintenance_window": "2025-03-20 02:00-04:00 UTC"
    }
  }'
```

## Quiet Hours

Respect user time zones and quiet hours. Notifications sent during quiet hours are queued and delivered when the window ends:

```json
{
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00",
    "timezone": "America/New_York"
  }
}
```

## Rate Limits

| Channel | Rate Limit |
|---------|-----------|
| Email | 1000/hour per recipient |
| SMS | 10/hour per recipient |
| Push | 100/hour per recipient |
| In-App | Unlimited |
