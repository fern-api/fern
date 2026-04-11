---
title: Getting Started
description: Set up your development environment and make your first Square API call.
slug: getting-started
---

# Getting Started

This guide walks you through setting up your development environment and making your first API call to Square.

## Prerequisites

Before you begin, make sure you have:

- A Square developer account ([sign up here](https://squareup.com/signup))
- An API access token from the Developer Dashboard
- A programming language environment (Node.js 18+, Python 3.8+, Java 11+, or similar)

## Install an SDK

Square provides official SDKs for multiple languages. Install the one that matches your stack:

```bash
# Node.js / TypeScript
npm install square

# Python
pip install squareup

# Java (Maven)
# Add to pom.xml:
# <dependency>
#   <groupId>com.squareup</groupId>
#   <artifactId>square</artifactId>
#   <version>35.0.0</version>
# </dependency>

# Ruby
gem install square.rb

# .NET
dotnet add package Square

# PHP
composer require square/square
```

## Configure the client

Initialize the Square client with your access token:

```typescript
import { SquareClient } from "square";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: "sandbox", // Use "production" for live transactions
});
```

```python
from square.client import Client

client = Client(
    access_token=os.environ["SQUARE_ACCESS_TOKEN"],
    environment="sandbox",
)
```

## Make your first API call

Let's retrieve your business locations to verify the connection:

```typescript
async function listLocations() {
  const response = await client.locations.list();

  if (response.locations) {
    for (const location of response.locations) {
      console.log(`${location.name} (${location.id})`);
      console.log(`  Status: ${location.status}`);
      console.log(`  Currency: ${location.currency}`);
    }
  }
}

listLocations();
```

## Sandbox vs Production

Square provides two environments:

| Environment | Base URL | Purpose |
|------------|----------|---------|
| Sandbox | `https://connect.squaresandbox.com` | Testing and development |
| Production | `https://connect.squareup.com` | Live transactions |

The sandbox environment uses test credentials and never processes real payments. Always develop and test in sandbox before switching to production.

### Sandbox test values

Use these test card numbers in the sandbox:

| Card number | Result |
|------------|--------|
| 4532 7597 3454 5858 | Successful charge |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 0010 | CVV failure |
| 4000 0000 0000 0028 | Address verification failure |

## Next steps

- [Authentication](/authentication) - Understand OAuth and API key authentication
- [Error Handling](/error-handling) - Handle API errors gracefully
- [API Reference](/api-reference) - Explore the complete API
