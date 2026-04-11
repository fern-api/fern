---
title: Migration Guide
description: Migrate your Acme API integration between versions with minimal disruption.
slug: migration-guide
---

# Migration Guide

This guide helps you migrate your Acme API integration between SDK and pipeline versions.

## Pipeline version history

| Pipeline | Release | Status |
|----------|---------|--------|
| Precision v3 | March 2025 | Current (latest) |
| Express v1 | October 2024 | Current |
| Standard v2 | June 2024 | Current |
| Standard v1 | January 2024 | Deprecated |
| Legacy v2 | August 2023 | End of life |
| Legacy v1 | January 2023 | End of life |

## Migrating to Precision v3

### Key changes

#### 1. Expanded format support

Precision v3 supports 70+ data formats compared to 29 in Standard v2:

```typescript
// Before (Standard v2)
const result = await client.data.process({
  input: "Hello world",
  pipeline: "standard_v2",
});

// After (Precision v3)
const result = await client.data.process({
  input: "Hello world",
  pipeline: "precision_v3",
});
```

#### 2. Multi-source joins

v3 introduces support for combining multiple data sources in a single request:

```typescript
const result = await client.data.process({
  inputs: [
    { source: "database", query: "SELECT * FROM users" },
    { source: "api", endpoint: "/v1/orders" },
    { source: "file", path: "data/enrichment.csv" },
  ],
  pipeline: "precision_v3",
  joinStrategy: "left",
});
```

#### 3. Input size limits

| Pipeline | Input size limit |
|----------|-----------------|
| Precision v3 | 5,000 characters |
| Standard v2 | 10,000 characters |
| Express v1 | 40,000 characters |

For inputs longer than the limit, split into chunks and aggregate the results.

### New features in v3

- **Advanced validation** - Enhanced data quality checks with detailed error reports
- **Better accuracy** - More accurate entity extraction and classification
- **Custom transforms** - Inline transformation rules for complex processing
- **Improved multilingual** - Better handling across language pairs

## SDK migration

### TypeScript SDK v1.x to v2.x

```typescript
// Before (v1.x)
import { AcmeClient } from "acme";
const client = new AcmeClient({ apiKey: "..." });

// After (v2.x)
import { AcmeClient } from "@acme/acme-js";
const client = new AcmeClient({ apiKey: "..." });
```

### Python SDK v0.x to v1.x

```python
# Before (v0.x)
from acme import process
result = process(input="Hello", pipeline="standard")

# After (v1.x)
from acme.client import Acme
client = Acme(api_key="...")
result = client.data.process(
    input="Hello",
    pipeline="standard_v2",
)
```

## General migration steps

1. **Read the changelog** for your target version
2. **Update your SDK** to the latest version
3. **Update pipeline IDs** in your configuration
4. **Test with sample inputs** to verify output quality
5. **Run your test suite** to catch breaking changes
6. **Monitor production** for errors after deployment
7. **Update documentation** to reflect new capabilities

## Backward compatibility

Non-breaking changes are added without version bumps:

- New optional fields in request/response objects
- New processing settings parameters
- New output format options
- New webhook event types

You do not need to update your code for non-breaking changes, but you should handle unknown fields gracefully.
