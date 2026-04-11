---
title: Subscriptions
slug: subscriptions
description: Manage recurring billing and subscription lifecycle.
---

# Subscriptions

The Acme API provides a full subscription management system for recurring billing, including plan management, trials, upgrades, downgrades, and cancellations.

## Creating a Subscription

```bash
curl -X POST https://api.acme.com/v1/subscriptions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "cust_abc",
    "plan_id": "plan_growth_monthly",
    "payment_method_id": "pm_card_xyz",
    "trial_days": 14
  }'
```

```json
{
  "id": "sub_123",
  "customer_id": "cust_abc",
  "plan_id": "plan_growth_monthly",
  "status": "trialing",
  "trial_start": "2025-03-15T00:00:00Z",
  "trial_end": "2025-03-29T00:00:00Z",
  "current_period_start": "2025-03-15T00:00:00Z",
  "current_period_end": "2025-04-15T00:00:00Z",
  "cancel_at_period_end": false
}
```

## Subscription Lifecycle

```
Created → Trialing → Active → Past Due → Canceled
                  ↓                   ↓
               Active → Paused → Active
                  ↓
               Active → Canceled (immediate)
```

### Status Reference

| Status | Description |
|--------|-------------|
| `trialing` | In free trial period |
| `active` | Paying and current |
| `past_due` | Payment failed, retrying |
| `paused` | Temporarily suspended |
| `canceled` | Terminated |
| `unpaid` | All retry attempts exhausted |

## Plan Changes

### Upgrading

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# Upgrade immediately with proration
subscription = client.subscriptions.update("sub_123",
    plan_id="plan_enterprise_monthly",
    proration_behavior="create_prorations"
)
```

### Downgrading

```python
# Downgrade at end of current period
subscription = client.subscriptions.update("sub_123",
    plan_id="plan_starter_monthly",
    proration_behavior="none",
    effective_date="period_end"
)
```

## Cancellation

```bash
# Cancel at end of current billing period
curl -X POST "https://api.acme.com/v1/subscriptions/sub_123/cancel" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"at_period_end": true}'

# Cancel immediately
curl -X POST "https://api.acme.com/v1/subscriptions/sub_123/cancel" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"at_period_end": false}'
```

## Usage-Based Billing

For metered plans, report usage throughout the billing period:

```bash
curl -X POST "https://api.acme.com/v1/subscriptions/sub_123/usage" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "metric": "api_calls",
    "quantity": 1500,
    "timestamp": "2025-03-15T14:30:00Z"
  }'
```

Usage is aggregated at the end of each billing period and invoiced automatically.

## Webhook Events

| Event | Trigger |
|-------|---------|
| `subscription.created` | New subscription created |
| `subscription.updated` | Plan or status changed |
| `subscription.trial_ending` | Trial ends in 3 days |
| `subscription.past_due` | Payment failed |
| `subscription.canceled` | Subscription canceled |
| `invoice.created` | New invoice generated |
| `invoice.paid` | Invoice payment succeeded |
| `invoice.payment_failed` | Invoice payment failed |

## Dunning (Failed Payment Recovery)

When a payment fails, the API automatically retries according to your dunning schedule:

| Attempt | Timing | Action |
|---------|--------|--------|
| 1st retry | Day 3 | Retry payment, notify customer |
| 2nd retry | Day 5 | Retry payment, send reminder |
| 3rd retry | Day 7 | Retry payment, send urgent notice |
| Final | Day 10 | Mark as `unpaid`, optionally cancel |

Configure dunning behavior in your account settings or per-subscription.
