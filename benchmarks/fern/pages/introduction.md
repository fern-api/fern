---
title: Introduction
description: Learn about the Square API platform and how to integrate payments, inventory, and customer management into your applications.
slug: introduction
---

# Introduction

The Square API platform provides a comprehensive suite of tools for building commerce applications. Whether you're processing payments, managing inventory, or building customer loyalty programs, Square's APIs offer the building blocks you need.

## Why Square?

Square processes billions of dollars in transactions annually. The platform is designed for:

- **Reliability**: 99.99% uptime SLA for payment processing
- **Security**: PCI DSS Level 1 certified, end-to-end encryption
- **Scale**: Handle thousands of transactions per second
- **Global reach**: Available in the US, Canada, UK, Australia, Japan, and more

## Platform overview

The Square API platform consists of several interconnected services:

| Service | Description | Common use cases |
|---------|-------------|-----------------|
| Payments | Process card and digital wallet payments | Point of sale, e-commerce checkout |
| Orders | Create and manage orders with line items | Restaurant ordering, retail checkout |
| Catalog | Manage products, categories, and pricing | Inventory management, menu systems |
| Customers | Store and manage customer profiles | Loyalty programs, CRM |
| Locations | Manage business locations and settings | Multi-location businesses |
| Invoices | Create and send invoices | Service businesses, B2B |
| Subscriptions | Manage recurring billing | SaaS, membership sites |

## Getting started

To start building with the Square API:

1. Create a Square developer account
2. Generate API credentials in the Developer Dashboard
3. Install the SDK for your programming language
4. Make your first API call

```bash
curl https://connect.squareup.com/v2/locations \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

The response includes your business locations:

```json
{
  "locations": [
    {
      "id": "L8GF7GQBX3M2T",
      "name": "Default Location",
      "status": "ACTIVE",
      "currency": "USD",
      "country": "US"
    }
  ]
}
```

## Next steps

- [Getting Started](/getting-started) - Set up your development environment
- [Authentication](/authentication) - Learn about API authentication
- [API Reference](/api-reference) - Explore the full API
