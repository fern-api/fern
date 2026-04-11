---
title: Configuration
description: Configure your Acme API integration with best practices for security and performance.
slug: configuration
---

# Configuration

This guide covers how to configure your Acme API integration for different environments, manage credentials securely, and optimize for performance.

## Client configuration

### TypeScript

```typescript
import { AcmeClient } from "@acme/acme-js";

const client = new AcmeClient({
  apiKey: process.env.ACME_API_KEY,
  timeout: 60000,
  maxRetries: 3,
});
```

### Python

```python
from acme.client import Acme

client = Acme(
    api_key=os.environ["ACME_API_KEY"],
    timeout=60,
    max_retries=3,
)
```

### Go

```go
client := acme.NewClient(
    os.Getenv("ACME_API_KEY"),
    acme.WithTimeout(60 * time.Second),
    acme.WithMaxRetries(3),
)
```

## Credential management

### Environment variables

Store credentials as environment variables, never in source code:

```bash
# .env (do NOT commit this file)
ACME_API_KEY=ak_live_...
ACME_WEBHOOK_SECRET=whsec_...
DEFAULT_REGION=us-east-1
DEFAULT_PIPELINE=standard_v2
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

async function getApiKey(): Promise<string> {
  const smClient = new SecretsManagerClient({ region: "us-east-1" });
  const response = await smClient.send(
    new GetSecretValueCommand({ SecretId: "acme/api-key" })
  );
  return response.SecretString!;
}
```

## Pipeline configuration

Configure default processing settings for consistent output across your application:

```typescript
interface PipelineConfig {
  pipelineId: string;
  region: string;
  settings: {
    quality: number;
    throughput: number;
    cacheEnabled: boolean;
    retryOnFailure: boolean;
    batchSize: number;
  };
  outputFormat: string;
}

const defaultPipelineConfig: PipelineConfig = {
  pipelineId: "standard_v2",
  region: "us-east-1",
  settings: {
    quality: 0.5,
    throughput: 0.75,
    cacheEnabled: true,
    retryOnFailure: true,
    batchSize: 100,
  },
  outputFormat: "json",
};
```

## Timeout configuration

Configure timeouts based on your use case:

| Operation | Recommended timeout |
|-----------|-------------------|
| Simple queries (under 500 chars) | 10-15 seconds |
| Batch processing (over 2000 items) | 30-60 seconds |
| Streaming operations | 120 seconds |
| File uploads | 120 seconds |
| Workflow execution | 300 seconds |
| Data export | 60 seconds |

## Logging configuration

Enable request logging for debugging:

```typescript
const client = new AcmeClient({
  apiKey: process.env.ACME_API_KEY,
});

// Log requests in development
if (process.env.NODE_ENV !== "production") {
  console.log("Acme client initialized in development mode");
}
```

## Multi-workspace configuration

For applications managing multiple workspaces:

```typescript
interface WorkspaceConfig {
  workspaceId: string;
  apiKey: string;
  regions: string[];
  quotaLimit: number;
}

class WorkspaceManager {
  private configs: Map<string, WorkspaceConfig> = new Map();

  async getClient(workspaceId: string): Promise<AcmeClient> {
    const config = this.configs.get(workspaceId);

    if (!config) {
      throw new Error(`Unknown workspace: ${workspaceId}`);
    }

    return new AcmeClient({
      apiKey: config.apiKey,
    });
  }
}
```

## Feature flags

Use feature flags to gradually roll out capabilities:

```typescript
interface FeatureFlags {
  enableStreaming: boolean;
  enableBatchProcessing: boolean;
  enableWorkflows: boolean;
  maxItemsPerRequest: number;
  defaultPipeline: string;
}

const defaultFlags: FeatureFlags = {
  enableStreaming: true,
  enableBatchProcessing: false,
  enableWorkflows: false,
  maxItemsPerRequest: 5000,
  defaultPipeline: "standard_v2",
};
```
