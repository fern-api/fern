# Seed Python Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![pypi](https://img.shields.io/pypi/v/fern_extra-properties)](https://pypi.python.org/pypi/fern_extra-properties)

The Seed Python library provides convenient access to the Seed API from Python.

## Installation

```sh
pip install fern_extra-properties
```

## Usage

Instantiate and use the client with the following:

```python
from seed.client import SeedExtraProperties

client = SeedExtraProperties(
    base_url="https://yourhost.com/path/to/api",
)
client.user.create_user(
    name="string",
)
```

## Async Client

The SDK also exports an `async` client so that you can make non-blocking calls to our API.

```python
import asyncio

from seed.client import AsyncSeedExtraProperties

client = AsyncSeedExtraProperties(
    base_url="https://yourhost.com/path/to/api",
)


async def main() -> None:
    await client.user.create_user(
        name="string",
    )


asyncio.run(
    main(),
)
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
