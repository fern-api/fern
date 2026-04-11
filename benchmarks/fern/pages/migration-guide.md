---
title: Migration Guide
description: Migrate your Square API integration between versions with minimal disruption.
slug: migration-guide
---

# Migration Guide

This guide helps you migrate your Square API integration between versions. Square uses date-based versioning, and each version may include breaking changes that require updates to your code.

## Version history

| Version | Release date | End of support |
|---------|-------------|----------------|
| 2024-01-18 | January 2024 | Current |
| 2023-10-18 | October 2023 | January 2025 |
| 2023-07-20 | July 2023 | October 2024 |
| 2023-04-20 | April 2023 | July 2024 |
| 2023-01-19 | January 2023 | April 2024 |

## Migrating to 2024-01-18

### Breaking changes

#### 1. Money fields now use BigInt

All monetary amount fields now return `BigInt` instead of `number` in the TypeScript SDK:

```typescript
// Before (2023-10-18)
const amount: number = payment.amountMoney.amount;

// After (2024-01-18)
const amount: bigint = payment.amountMoney.amount;

// Converting for display
const displayAmount = Number(amount) / 100;
```

#### 2. Deprecated endpoints removed

The following deprecated endpoints have been removed:

| Removed endpoint | Replacement |
|-----------------|-------------|
| `POST /v2/locations/{id}/transactions` | `POST /v2/payments` |
| `GET /v2/locations/{id}/transactions` | `GET /v2/payments` |
| `POST /v2/locations/{id}/refunds` | `POST /v2/refunds` |
| `GET /v1/items` | `GET /v2/catalog/list` |
| `POST /v1/items` | `POST /v2/catalog/object` |

#### 3. Search endpoint changes

Search endpoints now require explicit pagination:

```typescript
// Before
const response = await client.orders.search({
  locationIds: ["L8GF7GQBX3M2T"],
  query: { /* ... */ },
});

// After - must include limit
const response = await client.orders.search({
  locationIds: ["L8GF7GQBX3M2T"],
  query: { /* ... */ },
  limit: 100,
});
```

### New features

- **Terminal API** - Manage Square Terminal devices programmatically
- **Gift cards** - Create, activate, and manage gift cards
- **Vendor management** - Manage vendor relationships for inventory
- **Snippet API** - Embed custom content on Square Online sites

## General migration steps

1. **Read the changelog** for your target version
2. **Update your SDK** to the latest version
3. **Set the API version header** explicitly during migration:
   ```typescript
   // Pin to the old version while migrating
   headers: { "Square-Version": "2023-10-18" }
   ```
4. **Update affected code** for each breaking change
5. **Run your test suite** against the sandbox
6. **Remove the version header** to use the new default
7. **Monitor production** for errors after deployment

## Backward compatibility

Non-breaking changes are added to all supported versions:

- New optional fields in request/response objects
- New endpoints
- New enum values
- New webhook event types

You do not need to update your code for non-breaking changes, but you should handle unknown fields gracefully.

## SDK version mapping

| SDK version | API version | Notes |
|------------|-------------|-------|
| 35.x | 2024-01-18 | Latest |
| 33.x | 2023-10-18 | Deprecated |
| 30.x | 2023-07-20 | End of life |
| 28.x | 2023-04-20 | End of life |

Always use the latest SDK version for the best experience and security patches.
