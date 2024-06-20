# Seed Python Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![pypi](https://img.shields.io/pypi/v/fern_exhaustive)](https://pypi.python.org/pypi/fern_exhaustive)

The Seed Python library provides convenient access to the Seed API from Python.

## Installation

```sh
pip install fern_exhaustive
```

## Usage

Instantiate and use the client with the following:

```python
from seed.client import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.container.get_and_return_list_of_primitives(
    request=["string"],
)
```

## Async Client

The SDK also exports an `async` client so that you can make non-blocking calls to our API.

```python
from seed.client import AsyncSeedExhaustive

client = AsyncSeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
await client.endpoints.container.get_and_return_list_of_primitives(
    request=["string"],
)
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
