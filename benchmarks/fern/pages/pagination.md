---
title: Pagination
description: Navigate large result sets with cursor-based pagination in the Square API.
slug: pagination
---

# Pagination

Square API list endpoints return paginated results to keep response sizes manageable. This guide explains how to navigate through large result sets using cursor-based pagination.

## How pagination works

When a list endpoint has more results than can fit in a single response, the response includes a `cursor` field. Pass this cursor in your next request to retrieve the next page of results.

```
Request 1: GET /v2/customers?limit=100
Response:  { "customers": [...100 items...], "cursor": "abc123" }

Request 2: GET /v2/customers?limit=100&cursor=abc123
Response:  { "customers": [...100 items...], "cursor": "def456" }

Request 3: GET /v2/customers?limit=100&cursor=def456
Response:  { "customers": [...50 items...] }  // No cursor = last page
```

When the response does not include a `cursor` field, you have reached the last page.

## Page size limits

Each endpoint has its own default and maximum page sizes:

| Endpoint | Default | Maximum |
|----------|---------|---------|
| List Customers | 100 | 100 |
| List Payments | 100 | 100 |
| List Orders | 500 | 500 |
| List Catalog Objects | 100 | 1000 |
| List Invoices | 100 | 200 |
| List Subscriptions | 200 | 200 |
| Search Orders | 500 | 500 |
| List Transactions | 50 | 50 |

## Pagination examples

### Basic pagination

```typescript
async function getAllCustomers(): Promise<Customer[]> {
  const allCustomers: Customer[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.customers.list({
      limit: 100,
      cursor,
    });

    if (response.customers) {
      allCustomers.push(...response.customers);
    }

    cursor = response.cursor;
  } while (cursor);

  return allCustomers;
}
```

### Pagination with filtering

Some endpoints support filtering alongside pagination:

```typescript
async function getRecentPayments(
  locationId: string,
  since: string
): Promise<Payment[]> {
  const payments: Payment[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.payments.list({
      locationId,
      beginTime: since,
      sortOrder: "DESC",
      limit: 100,
      cursor,
    });

    if (response.payments) {
      payments.push(...response.payments);
    }

    cursor = response.cursor;
  } while (cursor);

  return payments;
}
```

### Async iterator pattern

For cleaner code, wrap pagination in an async generator:

```typescript
async function* paginateCustomers(
  limit = 100
): AsyncGenerator<Customer> {
  let cursor: string | undefined;

  do {
    const response = await client.customers.list({ limit, cursor });

    if (response.customers) {
      for (const customer of response.customers) {
        yield customer;
      }
    }

    cursor = response.cursor;
  } while (cursor);
}

// Usage
for await (const customer of paginateCustomers()) {
  console.log(customer.givenName, customer.familyName);
}
```

## Search endpoints

Some endpoints use `SearchXxx` instead of `ListXxx`. These accept a request body with query filters and return results with the same cursor-based pagination:

```typescript
const response = await client.orders.search({
  locationIds: ["L8GF7GQBX3M2T"],
  query: {
    filter: {
      stateFilter: { states: ["COMPLETED"] },
      dateTimeFilter: {
        createdAt: { startAt: "2024-01-01T00:00:00Z" },
      },
    },
    sort: { sortField: "CREATED_AT", sortOrder: "DESC" },
  },
  limit: 100,
  cursor: previousCursor,
});
```

## Best practices

1. **Always handle pagination** - Don't assume all results fit in one response
2. **Use reasonable page sizes** - Larger pages mean fewer requests but larger responses
3. **Don't store cursors long-term** - Cursors may expire and are not guaranteed to be stable
4. **Implement rate limiting** - Rapid pagination can trigger rate limits
5. **Process results as you go** - Don't accumulate millions of records in memory
