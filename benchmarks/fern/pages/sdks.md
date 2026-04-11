---
title: SDKs
description: Official Acme SDKs for TypeScript, Python, and other languages.
slug: sdks
---

# SDKs

Acme provides official SDKs that wrap the REST API with idiomatic interfaces, type safety, and built-in error handling.

## Available SDKs

| Language | Package | Install |
|----------|---------|---------|
| TypeScript/Node.js | `@acme/acme-js` | `npm install @acme/acme-js` |
| Python | `acme-sdk` | `pip install acme-sdk` |
| Go | `acme-go` | `go get github.com/acme/acme-go` |
| Ruby | `acme-sdk` | `gem install acme-sdk` |
| .NET | `Acme.SDK` | `dotnet add package Acme.SDK` |
| PHP | `acme/acme-php` | `composer require acme/acme-php` |

## TypeScript SDK

The TypeScript SDK provides full type safety and works in Node.js 18+:

```typescript
import { AcmeClient } from "@acme/acme-js";

const client = new AcmeClient({
  apiKey: process.env.ACME_API_KEY,
});

// Process data
const result = await client.data.process({
  input: "Hello from the TypeScript SDK!",
  pipeline: "standard_v2",
  outputFormat: "json",
});

console.log(result);
```

## Python SDK

```python
from acme.client import Acme
import os

client = Acme(
    api_key=os.environ["ACME_API_KEY"],
)

# Process data
result = client.data.process(
    input="Hello from the Python SDK!",
    pipeline="standard_v2",
    output_format="json",
)

print(result)
```

## Go SDK

```go
package main

import (
    "context"
    "os"
    acme "github.com/acme/acme-go"
)

func main() {
    client := acme.NewClient(os.Getenv("ACME_API_KEY"))

    result, err := client.Data.Process(
        context.Background(),
        &acme.ProcessRequest{
            Input:    "Hello from the Go SDK!",
            Pipeline: "standard_v2",
        },
    )
    if err != nil {
        panic(err)
    }

    os.WriteFile("output.json", result, 0644)
}
```

## SDK features

All official SDKs include:

- **Type safety** - Request and response types are fully typed
- **Automatic serialization** - Objects are serialized/deserialized automatically
- **Error handling** - Structured error types with detailed messages
- **Streaming support** - Built-in support for streaming responses
- **Retry logic** - Automatic retries for transient errors with exponential backoff
- **Pagination helpers** - Utilities for iterating through paginated results

## SDK configuration

| Option | Description | Default |
|--------|-------------|---------|
| `apiKey` | API key for authentication | Required |
| `timeout` | Request timeout in milliseconds | 60000 |
| `maxRetries` | Maximum number of retry attempts | 3 |
| `baseUrl` | Custom base URL | `https://api.acme.io` |

## Community SDKs

In addition to official SDKs, community-maintained SDKs are available for:

- Rust
- Swift
- Kotlin
- Elixir
- Dart/Flutter

These are not officially supported but may be useful for projects in those languages.
