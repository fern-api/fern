# Seed Python Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![pypi](https://img.shields.io/pypi/v/fern_query-parameters)](https://pypi.python.org/pypi/fern_query-parameters)

The Seed Python library provides convenient access to the Seed API from Python.

## Installation

```sh
pip install fern_query-parameters
```

## Usage

Instantiate and use the client with the following:

```python
import datetime
import uuid

from seed import NestedUser, User
from seed.client import SeedQueryParameters

client = SeedQueryParameters(
    base_url="https://yourhost.com/path/to/api",
)
client.user.get_username(
    limit=1,
    id=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    date=datetime.date.fromisoformat(
        "2023-01-15",
    ),
    deadline=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    bytes="SGVsbG8gd29ybGQh",
    user=User(
        name="string",
        tags=["string"],
    ),
    user_list=[
        User(
            name="string",
            tags=["string"],
        )
    ],
    optional_deadline=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    key_value={"string": "string"},
    optional_string="string",
    nested_user=NestedUser(
        name="string",
        user=User(
            name="string",
            tags=["string"],
        ),
    ),
    optional_user=User(
        name="string",
        tags=["string"],
    ),
    exclude_user=User(
        name="string",
        tags=["string"],
    ),
    filter="string",
)
```

## Async Client

The SDK also exports an `async` client so that you can make non-blocking calls to our API.

```python
import asyncio
import datetime
import uuid

from seed import NestedUser, User
from seed.client import AsyncSeedQueryParameters

client = AsyncSeedQueryParameters(
    base_url="https://yourhost.com/path/to/api",
)


async def main() -> None:
    await client.user.get_username(
        limit=1,
        id=uuid.UUID(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        date=datetime.date.fromisoformat(
            "2023-01-15",
        ),
        deadline=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        bytes="SGVsbG8gd29ybGQh",
        user=User(
            name="string",
            tags=["string"],
        ),
        user_list=[
            User(
                name="string",
                tags=["string"],
            )
        ],
        optional_deadline=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        key_value={"string": "string"},
        optional_string="string",
        nested_user=NestedUser(
            name="string",
            user=User(
                name="string",
                tags=["string"],
            ),
        ),
        optional_user=User(
            name="string",
            tags=["string"],
        ),
        exclude_user=User(
            name="string",
            tags=["string"],
        ),
        filter="string",
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
