---
title: Pagination
description: Navigate large result sets with cursor-based pagination in the Acme API.
slug: pagination
---

# Pagination

List endpoints in the Acme API return paginated results to keep response sizes manageable. This guide explains how to navigate through large result sets.

## How pagination works

When a list endpoint has more results than the page size, the response includes pagination metadata. Use the returned values to fetch subsequent pages.

```
Request 1: GET /v1/resources?page_size=100
Response:  { "resources": [...100 items...], "has_more": true, "next_cursor": "abc123" }

Request 2: GET /v1/resources?page_size=100&cursor=abc123
Response:  { "resources": [...50 items...], "has_more": false }
```

When `has_more` is `false`, you have reached the last page.

## Page size limits

Each endpoint has its own default and maximum page sizes:

| Endpoint | Default | Maximum |
|----------|---------|---------|
| List Resources | 30 | 100 |
| List Jobs | 100 | 1000 |
| List Pipelines | 30 | 100 |
| List Models | All | All |
| List Exports | 100 | 500 |
| List Workflows | 100 | 500 |
| List Events | 100 | 100 |

## Pagination examples

### Basic pagination

```typescript
async function getAllResources(): Promise<Resource[]> {
  const allResources: Resource[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.resources.list({
      pageSize: 100,
      cursor,
    });

    allResources.push(...response.resources);
    cursor = response.hasMore ? response.nextCursor : undefined;
  } while (cursor);

  return allResources;
}
```

### Pagination with filtering

Some endpoints support filtering alongside pagination:

```typescript
async function getRecentJobs(
  pipelineId: string,
  since: string
): Promise<Job[]> {
  const items: Job[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.jobs.list({
      pipelineId,
      startAfterJobId: cursor,
      pageSize: 100,
    });

    const filtered = response.jobs.filter(
      (item) => new Date(item.createdAt) > new Date(since)
    );
    items.push(...filtered);

    cursor = response.hasMore ? response.lastJobId : undefined;
  } while (cursor);

  return items;
}
```

### Async iterator pattern

For cleaner code, wrap pagination in an async generator:

```typescript
async function* paginateJobs(
  pageSize = 100
): AsyncGenerator<Job> {
  let cursor: string | undefined;

  do {
    const response = await client.jobs.list({ pageSize, cursor });

    for (const item of response.jobs) {
      yield item;
    }

    cursor = response.hasMore ? response.lastJobId : undefined;
  } while (cursor);
}

// Usage
for await (const item of paginateJobs()) {
  console.log(`${item.pipelineName}: ${item.input.substring(0, 50)}...`);
}
```

## Best practices

1. **Always handle pagination** - Don't assume all results fit in one response
2. **Use reasonable page sizes** - Larger pages mean fewer requests but larger responses
3. **Don't store cursors long-term** - Cursors may expire and are not guaranteed to be stable
4. **Implement rate limiting** - Rapid pagination can trigger rate limits
5. **Process results as you go** - Don't accumulate millions of records in memory
