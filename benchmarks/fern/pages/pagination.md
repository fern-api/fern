---
title: Pagination
description: Navigate large result sets with cursor-based pagination in the ElevenLabs API.
slug: pagination
---

# Pagination

List endpoints in the ElevenLabs API return paginated results to keep response sizes manageable. This guide explains how to navigate through large result sets.

## How pagination works

When a list endpoint has more results than the page size, the response includes pagination metadata. Use the returned values to fetch subsequent pages.

```
Request 1: GET /v1/voices?page_size=100
Response:  { "voices": [...100 items...], "has_more": true, "next_cursor": "abc123" }

Request 2: GET /v1/voices?page_size=100&cursor=abc123
Response:  { "voices": [...50 items...], "has_more": false }
```

When `has_more` is `false`, you have reached the last page.

## Page size limits

Each endpoint has its own default and maximum page sizes:

| Endpoint | Default | Maximum |
|----------|---------|---------|
| List Voices | 30 | 100 |
| List History Items | 100 | 1000 |
| List Voice Library | 30 | 100 |
| List Models | All | All |
| List Pronunciation Dictionaries | 100 | 500 |
| List Sound Effects | 100 | 500 |
| List Dubbing Projects | 100 | 100 |

## Pagination examples

### Basic pagination

```typescript
async function getAllVoices(): Promise<Voice[]> {
  const allVoices: Voice[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.voices.list({
      pageSize: 100,
      cursor,
    });

    allVoices.push(...response.voices);
    cursor = response.hasMore ? response.nextCursor : undefined;
  } while (cursor);

  return allVoices;
}
```

### Pagination with filtering

Some endpoints support filtering alongside pagination:

```typescript
async function getRecentHistory(
  voiceId: string,
  since: string
): Promise<HistoryItem[]> {
  const items: HistoryItem[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.history.list({
      voiceId,
      startAfterHistoryItemId: cursor,
      pageSize: 100,
    });

    const filtered = response.history.filter(
      (item) => new Date(item.dateUnix * 1000) > new Date(since)
    );
    items.push(...filtered);

    cursor = response.hasMore ? response.lastHistoryItemId : undefined;
  } while (cursor);

  return items;
}
```

### Async iterator pattern

For cleaner code, wrap pagination in an async generator:

```typescript
async function* paginateHistory(
  pageSize = 100
): AsyncGenerator<HistoryItem> {
  let cursor: string | undefined;

  do {
    const response = await client.history.list({ pageSize, cursor });

    for (const item of response.history) {
      yield item;
    }

    cursor = response.hasMore ? response.lastHistoryItemId : undefined;
  } while (cursor);
}

// Usage
for await (const item of paginateHistory()) {
  console.log(`${item.voiceName}: ${item.text.substring(0, 50)}...`);
}
```

## Best practices

1. **Always handle pagination** - Don't assume all results fit in one response
2. **Use reasonable page sizes** - Larger pages mean fewer requests but larger responses
3. **Don't store cursors long-term** - Cursors may expire and are not guaranteed to be stable
4. **Implement rate limiting** - Rapid pagination can trigger rate limits
5. **Process results as you go** - Don't accumulate millions of records in memory
