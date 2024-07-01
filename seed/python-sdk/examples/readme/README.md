# Seed Python Library

![](https://www.fernapi.com)

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![pypi](https://img.shields.io/pypi/v/fern_examples)](https://pypi.python.org/pypi/fern_examples)

The Seed Python library provides convenient access to the Seed API from Python.

## Documentation

API reference documentation is available [here](https://www.docs.fernapi.com).

## Installation

```sh
pip install fern_examples
```

## Usage

Instantiate and use the client with the following:

```python
from seed.client import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.service.create_movie(
    id="movie-c06a4ad7",
    prequel="movie-cv9b914f",
    title="The Boy and the Heron",
    from_="Hayao Miyazaki",
    rating=8.0,
    tag="tag-wf9as23d",
    metadata={
        "actors": ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
        "releaseDate": "2023-12-08",
        "ratings": {"rottenTomatoes": 97, "imdb": 7.6},
    },
)
```

## Async Client

The SDK also exports an `async` client so that you can make non-blocking calls to our API.

```python
import asyncio

from seed.client import AsyncSeedExamples
from seed.environment import SeedExamplesEnvironment

client = AsyncSeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)


async def main() -> None:
    await client.service.get_movie(
        movie_id="movie-c06a4ad7",
    )


asyncio.run(
    main(),
)
```

```python
import asyncio

from seed.client import AsyncSeedExamples
from seed.environment import SeedExamplesEnvironment

client = AsyncSeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)


async def main() -> None:
    await client.service.create_movie(
        id="movie-c06a4ad7",
        prequel="movie-cv9b914f",
        title="The Boy and the Heron",
        from_="Hayao Miyazaki",
        rating=8.0,
        tag="tag-wf9as23d",
        metadata={
            "actors": ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
            "releaseDate": "2023-12-08",
            "ratings": {"rottenTomatoes": 97, "imdb": 7.6},
        },
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
