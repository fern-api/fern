# Seed Python Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FPython)
[![pypi](https://img.shields.io/pypi/v/fern_python-graphql)](https://pypi.python.org/pypi/fern_python-graphql)

The Seed Python library provides convenient access to the Seed APIs from Python.

## Table of Contents

- [Installation](#installation)
- [Reference](#reference)
- [Graphql Field Selection](#graphql-field-selection)
- [Graphql Pagination](#graphql-pagination)
- [Graphql Subscriptions](#graphql-subscriptions)
- [Handling Graphql Errors](#handling-graphql-errors)
- [Raw Graphql Queries](#raw-graphql-queries)
- [Usage](#usage)
- [Async Client](#async-client)
- [Exception Handling](#exception-handling)
- [Advanced](#advanced)
  - [Access Raw Response Data](#access-raw-response-data)
  - [Retries](#retries)
  - [Timeouts](#timeouts)
  - [Custom Client](#custom-client)
- [Contributing](#contributing)

## Installation

```sh
pip install fern_python-graphql
```

## Reference

A full reference for this library is available [here](./reference.md).

## GraphQL Field Selection

Operations take a fluent **field selection** — chain field methods on the builder to choose exactly which fields come back in a single GraphQL document (deeply, in one request). Omit `selection` to fetch a safe default. Nested objects take their own selection lambda; use `.all_()` to select every scalar at a level.

```python
data = client.query.viewer(selection=lambda x: x.id().name())
```

## GraphQL Pagination

Relay connections expose auto-pagination under `paginate`. The returned pager follows `pageInfo.endCursor` across pages, fetching lazily as you iterate, and yields each node. Use the async client for an `async for` pager.

```python
for node in client.query.paginate.feed(first=50):
    print(node)
```

## GraphQL Subscriptions

Subscription operations stream over a WebSocket (`graphql-transport-ws`) on the **async** client and return an `AsyncIterator` of events typed to your selection. Breaking out of the loop tears down the socket.

```python
async for event in async_client.subscription.post_added(
    selection=lambda x: x.id().title(),
):
    print(event)
```

## Handling GraphQL Errors

GraphQL is a partial-success protocol: a response can carry both data and errors. Operations raise a `GraphqlError` (carrying `.errors` and any partial `.data`) when the response contains errors.

```python
from .core.graphql import GraphqlError

try:
    data = client.query.viewer()
except GraphqlError as error:
    print(error.errors)  # operation errors
    print(error.data)  # partial data, if any
```

## Raw GraphQL Queries

Power users can send a hand-written GraphQL document with `client.raw`, bypassing the typed operation surface. It reuses the SDK's auth, retries, and base URL, and returns the response `data` (or the full `{data, errors}` envelope with `throw_on_error=False`).

```python
data = client.raw(
    "query ($id: ID!) { order(id: $id) { id } }",
    variables={"id": "order-123"},
)
```

## Usage

Instantiate and use the client with the following:

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.query.viewer()
```

## Async Client

The SDK also exports an `async` client so that you can make non-blocking calls to our API. Note that if you are constructing an Async httpx client class to pass into this client, use `httpx.AsyncClient()` instead of `httpx.Client()` (e.g. for the `httpx_client` parameter of this client).

```python
import asyncio

from seed import AsyncSeedApi

client = AsyncSeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)


async def main() -> None:
    await client.query.viewer()


asyncio.run(main())
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be thrown.

```python
from seed.core.api_error import ApiError

try:
    client.query.viewer()
except ApiError as e:
    print(e.status_code)
    print(e.body)
```

## Advanced

### Access Raw Response Data

The SDK provides access to raw response data, including headers, through the `.with_raw_response` property.
The `.with_raw_response` property returns a "raw" client that can be used to access the `.headers` and `.data` attributes.

```python
from seed import SeedApi

client = SeedApi(...)
response = client.query.with_raw_response.viewer()
print(response.headers)  # access the response headers
print(response.status_code)  # access the response status code
print(response.data)  # access the underlying object
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

Which status codes are retried depends on the `retryStatusCodes` generator configuration:

**`legacy`** (current default): retries on
- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [409](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409) (Conflict)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses) (All server errors, including 500)

**`recommended`**: retries on
- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [409](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409) (Conflict)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [502](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502) (Bad Gateway)
- [503](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503) (Service Unavailable)
- [504](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/504) (Gateway Timeout)

Use the `max_retries` request option to configure this behavior.

```python
client.query.viewer(request_options={
    "max_retries": 1
})
```

### Timeouts

The SDK defaults to a 60 second timeout. You can configure this with a timeout option at the client or request level.

```python
from seed import SeedApi

client = SeedApi(..., timeout=20.0)

# Override timeout for a specific method
client.query.viewer(request_options={
    "timeout_in_seconds": 1
})
```

### Custom Client

You can override the `httpx` client to customize it for your use-case. Some common use-cases include support for proxies
and transports.

```python
import httpx
from seed import SeedApi

client = SeedApi(
    ...,
    httpx_client=httpx.Client(
        proxy="http://my.test.proxy.example.com",
        transport=httpx.HTTPTransport(local_address="0.0.0.0"),
    ),
)
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
