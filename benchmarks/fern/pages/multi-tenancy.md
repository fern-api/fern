---
title: Multi-Tenancy
slug: multi-tenancy
description: Manage multiple merchants or businesses from a single platform account.
---

# Multi-Tenancy

The Acme API supports multi-tenant architectures where a single platform manages multiple merchants, stores, or sub-accounts. This is designed for marketplaces, SaaS platforms, and franchise operators.

## Platform vs Merchant Accounts

| Feature | Platform Account | Merchant Account |
|---------|-----------------|------------------|
| API Key Prefix | `sk_platform_` | `sk_merchant_` |
| Can create merchants | Yes | No |
| Can access all merchants | Yes (with scope) | Own data only |
| Billing | Consolidated | Per-merchant or platform-paid |

## Creating Merchant Accounts

```bash
curl -X POST https://api.acme.com/v1/merchants \
  -H "Authorization: Bearer sk_platform_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Store",
    "email": "owner@downtownstore.com",
    "metadata": {
      "franchise_id": "franchise_42",
      "region": "us-west"
    }
  }'
```

```json
{
  "id": "merchant_xyz",
  "name": "Downtown Store",
  "status": "active",
  "created_at": "2025-03-15T10:00:00Z",
  "api_keys": {
    "test": "sk_test_merchant_xyz_abc",
    "live": "sk_live_merchant_xyz_def"
  }
}
```

## Acting on Behalf of a Merchant

Use the `Acme-Merchant` header to perform operations in the context of a specific merchant:

```bash
curl https://api.acme.com/v1/orders \
  -H "Authorization: Bearer sk_platform_abc123" \
  -H "Acme-Merchant: merchant_xyz"
```

All resources created, read, or modified in this context are scoped to the specified merchant.

## Data Isolation

Merchant data is strictly isolated:

- Orders created under one merchant are invisible to other merchants
- Products, customers, and all other resources are merchant-scoped
- Cross-merchant queries are only available to the platform account
- Database-level row isolation ensures no data leakage

## Platform-Level Queries

As a platform, query data across all merchants:

```python
import acme

platform = acme.Client(api_key="sk_platform_abc123")

# Get orders across all merchants
all_orders = platform.orders.list(
    expand=["merchant"],
    created_after="2025-03-01"
)

# Get per-merchant analytics
analytics = platform.analytics.revenue(
    period="30d",
    group_by="merchant_id"
)

for row in analytics.rows:
    print(f"Merchant {row.merchant_id}: ${row.revenue / 100:.2f}")
```

## Revenue Sharing

Configure automatic revenue splits between the platform and merchants:

```bash
curl -X POST https://api.acme.com/v1/merchants/merchant_xyz/revenue-share \
  -H "Authorization: Bearer sk_platform_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "platform_fee_percent": 15,
    "minimum_fee_cents": 50,
    "payout_schedule": "weekly"
  }'
```

## Merchant Onboarding

Streamline merchant onboarding with the hosted onboarding flow:

```bash
curl -X POST https://api.acme.com/v1/merchants/onboarding-links \
  -H "Authorization: Bearer sk_platform_abc123" \
  -d '{
    "merchant_id": "merchant_xyz",
    "return_url": "https://platform.com/onboarding/complete",
    "collect": ["business_info", "bank_account", "tax_id"]
  }'
```

This returns a URL where the merchant can complete their profile, verify their identity, and connect their bank account.
