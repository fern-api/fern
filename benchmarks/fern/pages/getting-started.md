---
title: Getting Started
description: Set up your development environment and make your first Acme API call.
slug: getting-started
---

# Getting Started

This guide walks you through setting up your development environment and making your first API call to the Acme platform.

## Prerequisites

Before you begin, make sure you have:

- An Acme account ([sign up here](https://acme.io))
- An API key from the Dashboard
- A programming language environment (Node.js 18+, Python 3.8+, or similar)

## Install an SDK

Official SDKs are available for multiple languages:

```bash
# Node.js / TypeScript
npm install @acme/acme-js

# Python
pip install acme-sdk

# Go
go get github.com/acme/acme-go

# Ruby
gem install acme-sdk

# .NET
dotnet add package Acme.SDK

# PHP
composer require acme/acme-php
```

## Configure the client

Initialize the client with your API key:

```typescript
import { AcmeClient } from "@acme/acme-js";

const client = new AcmeClient({
  apiKey: process.env.ACME_API_KEY,
});
```

```python
from acme.client import Acme

client = Acme(
    api_key=os.environ["ACME_API_KEY"],
)
```

## Make your first API call

Let's process some data to verify the connection:

```typescript
import { AcmeClient } from "@acme/acme-js";

async function processData() {
  const result = await client.data.process({
    input: "The first step is what sets everything in motion.",
    pipeline: "standard_v2",
    outputFormat: "json",
  });

  console.log(result);
}

processData();
```

## Processing pipelines

Acme offers several pipelines optimized for different use cases:

| Pipeline | Latency | Throughput | Languages | Best for |
|----------|---------|------------|-----------|----------|
| Standard v2 | Medium | High | 70+ | General-purpose processing |
| Express v1 | Low | Very High | 29 | Real-time, low-latency apps |
| Precision v3 | High | Medium | 32 | Accuracy-critical workloads |
| Legacy v1 | Low | Medium | 1 | English-only applications |

## Resource types

You can manage resources from several categories:

| Category | Description |
|----------|-------------|
| Compute | Virtual machines and serverless functions |
| Storage | Object storage and file systems |
| Database | Managed databases and caches |
| Network | Load balancers, DNS, and VPNs |
| Identity | Users, groups, and service accounts |

## Next steps

- [Authentication](/authentication) - Understand API key management
- [Configuration](/configuration) - Deep dive into client setup
- [API Reference](/api-reference) - Explore the complete API
