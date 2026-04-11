---
title: Changelog
description: Track changes and updates to the Square API platform.
slug: changelog
---

# Changelog

Track the latest changes, new features, and improvements to the Square API platform.

## January 2024

### API version 2024-01-18

**Breaking changes**:
- Monetary amounts in the TypeScript SDK now use `BigInt` instead of `number`
- Removed deprecated V1 transaction endpoints
- Search endpoints now require explicit `limit` parameter

**New features**:
- Terminal API for managing Square Terminal devices
- Gift card API for creating and managing gift cards
- Vendor management API for inventory suppliers
- Snippet API for Square Online customization

**Improvements**:
- Improved error messages for payment failures
- Faster response times for catalog search (avg 40% improvement)
- Webhook delivery reliability improved to 99.95%

### SDK releases

| SDK | Version | Release date |
|-----|---------|-------------|
| TypeScript | 35.1.0 | January 25, 2024 |
| Python | 35.1.0 | January 25, 2024 |
| Java | 35.1.0 | January 26, 2024 |
| Ruby | 35.1.0 | January 26, 2024 |
| .NET | 35.1.0 | January 27, 2024 |
| PHP | 35.1.0 | January 27, 2024 |

## October 2023

### API version 2023-10-18

**New features**:
- Subscription billing with custom pricing
- Invoice attachments support
- Bulk customer import endpoint
- Location-level tax settings

**Improvements**:
- OAuth token refresh now returns remaining TTL
- List endpoints support sorting by multiple fields
- Catalog search supports fuzzy matching

**Bug fixes**:
- Fixed incorrect currency conversion for JPY amounts
- Fixed webhook delivery delays for `order.updated` events
- Fixed pagination cursor expiration for large result sets

## July 2023

### API version 2023-07-20

**New features**:
- Custom attributes API for extending Square objects
- Booking API for appointment scheduling
- Merchant custom attributes for business metadata
- Enhanced reporting API with custom date ranges

**Improvements**:
- Payment processing latency reduced by 15%
- Catalog batch upsert now supports up to 10,000 objects
- Improved error messages for OAuth scope mismatches

**Deprecations**:
- V1 Items API (use Catalog API instead)
- V1 Fees API (use Catalog API tax objects instead)
- `ListTransactions` endpoint (use `ListPayments` instead)

## April 2023

### API version 2023-04-20

**New features**:
- Loyalty API promotions
- Team API for managing employees
- Bank account payment support
- Inventory transfer API

**Improvements**:
- Webhook retry logic improved with exponential backoff
- API rate limits increased for Payments endpoints (20 -> 30 RPS)
- Response compression enabled by default

## Migration resources

For detailed migration guides between versions, see the [Migration Guide](/migration-guide).

## Subscribing to updates

Stay informed about API changes:

- **Developer Blog**: Technical articles and announcements
- **Release Notes**: Detailed per-version changelog
- **Status Page**: Real-time platform status and incident reports
- **Developer Newsletter**: Monthly digest of changes and best practices
