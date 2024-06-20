# Seed Python Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![pypi](https://img.shields.io/pypi/v/fern_imdb)](https://pypi.python.org/pypi/fern_imdb)

The Seed Python library provides convenient access to the Seed API from Python.

## Installation

```sh
pip install fern_imdb
```

## Usage

Instantiate and use the client with the following:

```python
from seed.client import SeedApi

client = SeedApi(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.imdb.create_movie(
    title="string",
    rating=1.1,
)
```

## Async Client

The SDK also exports an `async` client so that you can make non-blocking calls to our API.

```python
from seed.client import AsyncSeedApi

client = AsyncSeedApi(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
await client.imdb.create_movie(
    title="string",
    rating=1.1,
)
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
