---
title: SDKs
description: Official Square SDKs for TypeScript, Python, Java, Ruby, .NET, and PHP.
slug: sdks
---

# SDKs

Square provides official SDKs for popular programming languages. Each SDK wraps the REST API with idiomatic interfaces, type safety, and built-in error handling.

## Available SDKs

| Language | Package | Version | Install |
|----------|---------|---------|---------|
| TypeScript/Node.js | `square` | 35.0.0 | `npm install square` |
| Python | `squareup` | 35.0.0 | `pip install squareup` |
| Java | `com.squareup:square` | 35.0.0 | Maven/Gradle |
| Ruby | `square.rb` | 35.0.0 | `gem install square.rb` |
| .NET | `Square` | 35.0.0 | `dotnet add package Square` |
| PHP | `square/square` | 35.0.0 | `composer require square/square` |

## TypeScript SDK

The TypeScript SDK provides full type safety and works in Node.js 18+:

```typescript
import { SquareClient } from "square";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: "sandbox",
});

// Create a payment
const payment = await client.payments.create({
  sourceId: "cnon:card-nonce-ok",
  idempotencyKey: crypto.randomUUID(),
  amountMoney: {
    amount: BigInt(1000),
    currency: "USD",
  },
  locationId: "L8GF7GQBX3M2T",
});

console.log(`Payment ${payment.payment?.id}: ${payment.payment?.status}`);
```

## Python SDK

```python
from square.client import Client
import os
import uuid

client = Client(
    access_token=os.environ["SQUARE_ACCESS_TOKEN"],
    environment="sandbox",
)

# Create a payment
result = client.payments.create_payment(
    body={
        "source_id": "cnon:card-nonce-ok",
        "idempotency_key": str(uuid.uuid4()),
        "amount_money": {
            "amount": 1000,
            "currency": "USD",
        },
        "location_id": "L8GF7GQBX3M2T",
    }
)

if result.is_success():
    payment = result.body["payment"]
    print(f"Payment {payment['id']}: {payment['status']}")
elif result.is_error():
    for error in result.errors:
        print(f"Error: {error['detail']}")
```

## Java SDK

```java
import com.squareup.square.SquareClient;
import com.squareup.square.models.*;

SquareClient client = new SquareClient.Builder()
    .accessToken(System.getenv("SQUARE_ACCESS_TOKEN"))
    .environment("sandbox")
    .build();

CreatePaymentRequest body = new CreatePaymentRequest.Builder(
    "cnon:card-nonce-ok",
    UUID.randomUUID().toString()
)
    .amountMoney(new Money.Builder()
        .amount(1000L)
        .currency("USD")
        .build())
    .locationId("L8GF7GQBX3M2T")
    .build();

CreatePaymentResponse response = client.getPaymentsApi().createPayment(body);
Payment payment = response.getPayment();
System.out.println("Payment " + payment.getId() + ": " + payment.getStatus());
```

## SDK features

All official SDKs include:

- **Type safety** - Request and response types are fully typed
- **Automatic serialization** - Objects are serialized/deserialized automatically
- **Error handling** - Structured error types with detailed messages
- **Pagination helpers** - Built-in cursor management for list endpoints
- **Retry logic** - Automatic retries for transient errors
- **Idempotency** - Built-in idempotency key support
- **Sandbox support** - Easy switching between sandbox and production

## SDK configuration

| Option | Description | Default |
|--------|-------------|---------|
| `token` | Access token for authentication | Required |
| `environment` | `sandbox` or `production` | `production` |
| `timeout` | Request timeout in milliseconds | 60000 |
| `httpClient` | Custom HTTP client | Built-in |
| `userAgent` | Custom user agent suffix | SDK default |

## Community SDKs

In addition to official SDKs, community-maintained SDKs are available for:

- Go
- Rust
- Swift
- Kotlin
- Elixir

These are not officially supported by Square but may be useful for projects in those languages.
