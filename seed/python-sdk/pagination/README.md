# Seed Python Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![pypi](https://img.shields.io/pypi/v/fern_pagination)](https://pypi.python.org/pypi/fern_pagination)

The Seed Python library provides convenient access to the Seed API from Python.

## Installation

```sh
pip install fern_pagination
```

## Usage

Instantiate and use the client with the following:

```python
from seed.client import SeedPagination

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_cursor_pagination(
    page=1,
    per_page=1,
    order="asc",
    starting_after="string",
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page
```

## Async Client

The SDK also exports an `async` client so that you can make non-blocking calls to our API.

```python
import asyncio

from seed.client import AsyncSeedPagination

client = AsyncSeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)


async def main() -> None:
    response = await client.users.list_with_cursor_pagination(
        page=1,
        per_page=1,
        order="asc",
        starting_after="string",
    )
    async for item in response:
        yield item
    # alternatively, you can paginate page-by-page
    async for page in response.iter_pages():
        yield page


asyncio.run(
    main(),
)
```

## Pagination

Paginated requests will return a `SyncPager` or `AsyncPager`, which can be used as generators for the underlying object.

```python
from seed.client import SeedPagination

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_cursor_pagination(
    page=1,
    per_page=1,
    order="asc",
    starting_after="string",
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
