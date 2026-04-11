---
title: Configuration
description: Configure your Square API integration with best practices for security and performance.
slug: configuration
---

# Configuration

This guide covers how to configure your Square API integration for different environments, manage credentials securely, and optimize for performance.

## Client configuration

### TypeScript

```typescript
import { SquareClient } from "square";

const client = new SquareClient({
  // Required
  token: process.env.SQUARE_ACCESS_TOKEN,

  // Optional - defaults to "production"
  environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});
```

### Python

```python
from square.client import Client

client = Client(
    access_token=os.environ["SQUARE_ACCESS_TOKEN"],
    environment="sandbox",
    max_retries=3,
    timeout=30,
)
```

### Java

```java
SquareClient client = new SquareClient.Builder()
    .accessToken(System.getenv("SQUARE_ACCESS_TOKEN"))
    .environment("sandbox")
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .build();
```

## Credential management

### Environment variables

Store credentials as environment variables, never in source code:

```bash
# .env (do NOT commit this file)
SQUARE_ACCESS_TOKEN=EAAAl...
SQUARE_APP_ID=sq0idp-...
SQUARE_APP_SECRET=sq0csp-...
SQUARE_WEBHOOK_SIGNATURE_KEY=...
SQUARE_LOCATION_ID=L8GF7GQBX3M2T
```

### Secrets managers

For production deployments, use a secrets manager:

| Provider | Service |
|----------|---------|
| AWS | Secrets Manager or Parameter Store |
| Google Cloud | Secret Manager |
| Azure | Key Vault |
| Hashicorp | Vault |
| Kubernetes | Secrets |

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function getSquareToken(): Promise<string> {
  const client = new SecretsManagerClient({ region: "us-east-1" });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: "square/api-token" })
  );
  return response.SecretString!;
}
```

## Location configuration

Most Square API calls require a `location_id`. If your business has multiple locations, you may need to manage which location is used for each operation:

```typescript
interface LocationConfig {
  id: string;
  name: string;
  currency: string;
  timezone: string;
}

async function getLocations(): Promise<LocationConfig[]> {
  const response = await client.locations.list();

  return (response.locations ?? [])
    .filter((loc) => loc.status === "ACTIVE")
    .map((loc) => ({
      id: loc.id!,
      name: loc.name!,
      currency: loc.currency!,
      timezone: loc.timezone!,
    }));
}
```

## Timeout configuration

Configure timeouts based on your use case:

| Operation | Recommended timeout |
|-----------|-------------------|
| Simple reads (get, list) | 10-15 seconds |
| Payments | 30 seconds |
| Batch operations | 60 seconds |
| File uploads | 120 seconds |
| Search queries | 30 seconds |

## Logging configuration

Enable request/response logging for debugging:

```typescript
import { SquareClient } from "square";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: "sandbox",
});

// Log all requests in development
if (process.env.NODE_ENV !== "production") {
  client.interceptors.request.use((config) => {
    console.log(`[Square] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}
```

## Multi-tenant configuration

For applications serving multiple merchants (OAuth), manage per-merchant configuration:

```typescript
interface MerchantConfig {
  merchantId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  locationIds: string[];
}

class MerchantConfigStore {
  private configs: Map<string, MerchantConfig> = new Map();

  async getClient(merchantId: string): Promise<SquareClient> {
    let config = this.configs.get(merchantId);

    if (!config) {
      config = await this.loadFromDatabase(merchantId);
      this.configs.set(merchantId, config);
    }

    // Check if token needs refresh
    if (config.tokenExpiresAt < new Date()) {
      config = await this.refreshToken(config);
      this.configs.set(merchantId, config);
    }

    return new SquareClient({
      token: config.accessToken,
      environment: "production",
    });
  }
}
```

## Feature flags

Use feature flags to gradually roll out Square API features:

```typescript
interface FeatureFlags {
  enableSubscriptions: boolean;
  enableInvoicing: boolean;
  enableLoyalty: boolean;
  maxPaymentAmount: number;
}

const defaultFlags: FeatureFlags = {
  enableSubscriptions: false,
  enableInvoicing: false,
  enableLoyalty: false,
  maxPaymentAmount: 100000, // $1,000.00
};
```
