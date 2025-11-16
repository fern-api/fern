# Seed Python Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FPython)
[![pypi](https://img.shields.io/pypi/v/fern_query-parameters-openapi)](https://pypi.python.org/pypi/fern_query-parameters-openapi)

The Seed Python library provides convenient access to the Seed APIs from Python.

## Table of Contents

- [Installation](#installation)
- [Reference](#reference)
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
pip install fern_query-parameters-openapi
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```python
import datetime

from seed import NestedUser, SeedApi, User

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)
client.search(
    limit=1,
    id="id",
    date=datetime.date.fromisoformat(
        "2023-01-15",
    ),
    deadline=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    bytes="bytes",
    user=User(
        name="name",
        tags=["tags", "tags"],
    ),
    user_list=User(
        name="name",
        tags=["tags", "tags"],
    ),
    optional_deadline=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    key_value={"keyValue": "keyValue"},
    optional_string="optionalString",
    nested_user=NestedUser(
        name="name",
        user=User(
            name="name",
            tags=["tags", "tags"],
        ),
    ),
    optional_user=User(
        name="name",
        tags=["tags", "tags"],
    ),
    exclude_user=User(
        name="name",
        tags=["tags", "tags"],
    ),
    filter="filter",
    neighbor=User(
        name="name",
        tags=["tags", "tags"],
    ),
    neighbor_required=User(
        name="name",
        tags=["tags", "tags"],
    ),
)
```

## Async Client

The SDK also exports an `async` client so that you can make non-blocking calls to our API. Note that if you are constructing an Async httpx client class to pass into this client, use `httpx.AsyncClient()` instead of `httpx.Client()` (e.g. for the `httpx_client` parameter of this client).

```python
import asyncio
import datetime

from seed import AsyncSeedApi, NestedUser, User

client = AsyncSeedApi(
    base_url="https://yourhost.com/path/to/api",
)


async def main() -> None:
    await client.search(
        limit=1,
        id="id",
        date=datetime.date.fromisoformat(
            "2023-01-15",
        ),
        deadline=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        bytes="bytes",
        user=User(
            name="name",
            tags=["tags", "tags"],
        ),
        user_list=User(
            name="name",
            tags=["tags", "tags"],
        ),
        optional_deadline=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        key_value={"keyValue": "keyValue"},
        optional_string="optionalString",
        nested_user=NestedUser(
            name="name",
            user=User(
                name="name",
                tags=["tags", "tags"],
            ),
        ),
        optional_user=User(
            name="name",
            tags=["tags", "tags"],
        ),
        exclude_user=User(
            name="name",
            tags=["tags", "tags"],
        ),
        filter="filter",
        neighbor=User(
            name="name",
            tags=["tags", "tags"],
        ),
        neighbor_required=User(
            name="name",
            tags=["tags", "tags"],
        ),
    )


asyncio.run(main())
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be thrown.

```python
from seed.core.api_error import ApiError

try:
    client.search()
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

client = SeedApi(
    ...,
)
response = client.with_raw_response.search()
print(response.headers)  # access the response headers
print(response.data)  # access the underlying object
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `max_retries` request option to configure this behavior.

```python
client.search(request_options={
    "max_retries": 1
})
```

### Timeouts

The SDK defaults to a 60 second timeout. You can configure this with a timeout option at the client or request level.

```python

from seed import SeedApi

client = SeedApi(
    ...,
    timeout=20.0,
)


# Override timeout for a specific method
client.search(request_options={
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
