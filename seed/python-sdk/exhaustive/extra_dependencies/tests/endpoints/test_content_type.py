# This file was auto-generated by Fern from our API Definition.

from seed import SeedExhaustive
from seed import AsyncSeedExhaustive
import datetime
import uuid


async def test_post_json_patch_content_type(client: SeedExhaustive, async_client: AsyncSeedExhaustive) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.endpoints.content_type.post_json_patch_content_type(
            string="string",
            integer=1,
            long_=1000000,
            double=1.1,
            bool_=True,
            datetime=datetime.datetime.fromisoformat("2024-01-15 09:30:00+00:00"),
            date=datetime.date.fromisoformat("2023-01-15"),
            uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base_64="SGVsbG8gd29ybGQh",
            list_=["list", "list"],
            set_={"set"},
            map_={1: "map"},
            bigint=1000000,
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.endpoints.content_type.post_json_patch_content_type(
            string="string",
            integer=1,
            long_=1000000,
            double=1.1,
            bool_=True,
            datetime=datetime.datetime.fromisoformat("2024-01-15 09:30:00+00:00"),
            date=datetime.date.fromisoformat("2023-01-15"),
            uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base_64="SGVsbG8gd29ybGQh",
            list_=["list", "list"],
            set_={"set"},
            map_={1: "map"},
            bigint=1000000,
        )  # type: ignore[func-returns-value]
        is None
    )


async def test_post_json_patch_content_with_charset_type(
    client: SeedExhaustive, async_client: AsyncSeedExhaustive
) -> None:
    # Type ignore to avoid mypy complaining about the function not being meant to return a value
    assert (
        client.endpoints.content_type.post_json_patch_content_with_charset_type(
            string="string",
            integer=1,
            long_=1000000,
            double=1.1,
            bool_=True,
            datetime=datetime.datetime.fromisoformat("2024-01-15 09:30:00+00:00"),
            date=datetime.date.fromisoformat("2023-01-15"),
            uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base_64="SGVsbG8gd29ybGQh",
            list_=["list", "list"],
            set_={"set"},
            map_={1: "map"},
            bigint=1000000,
        )  # type: ignore[func-returns-value]
        is None
    )

    assert (
        await async_client.endpoints.content_type.post_json_patch_content_with_charset_type(
            string="string",
            integer=1,
            long_=1000000,
            double=1.1,
            bool_=True,
            datetime=datetime.datetime.fromisoformat("2024-01-15 09:30:00+00:00"),
            date=datetime.date.fromisoformat("2023-01-15"),
            uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base_64="SGVsbG8gd29ybGQh",
            list_=["list", "list"],
            set_={"set"},
            map_={1: "map"},
            bigint=1000000,
        )  # type: ignore[func-returns-value]
        is None
    )
