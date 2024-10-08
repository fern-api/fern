# This file was auto-generated by Fern from our API Definition.

from seed import SeedExhaustive
from seed import AsyncSeedExhaustive
import typing
from ..utilities import validate_response


async def test_test_get(client: SeedExhaustive, async_client: AsyncSeedExhaustive) -> None:
    expected_response: typing.Any = "string"
    expected_types: typing.Any = None
    response = client.endpoints.http_methods.test_get(id="id")
    validate_response(response, expected_response, expected_types)

    async_response = await async_client.endpoints.http_methods.test_get(id="id")
    validate_response(async_response, expected_response, expected_types)


async def test_test_post(client: SeedExhaustive, async_client: AsyncSeedExhaustive) -> None:
    expected_response: typing.Any = {}
    expected_types: typing.Any = {
        "string": None,
        "integer": None,
        "long": None,
        "double": None,
        "bool": None,
        "datetime": None,
        "date": None,
        "uuid": None,
        "base64": None,
        "list": None,
        "set": None,
        "map": None,
        "bigint": None,
    }
    response = client.endpoints.http_methods.test_post(string="string")
    validate_response(response, expected_response, expected_types)

    async_response = await async_client.endpoints.http_methods.test_post(string="string")
    validate_response(async_response, expected_response, expected_types)


async def test_test_put(client: SeedExhaustive, async_client: AsyncSeedExhaustive) -> None:
    expected_response: typing.Any = {}
    expected_types: typing.Any = {
        "string": None,
        "integer": None,
        "long": None,
        "double": None,
        "bool": None,
        "datetime": None,
        "date": None,
        "uuid": None,
        "base64": None,
        "list": None,
        "set": None,
        "map": None,
        "bigint": None,
    }
    response = client.endpoints.http_methods.test_put(id="id", string="string")
    validate_response(response, expected_response, expected_types)

    async_response = await async_client.endpoints.http_methods.test_put(id="id", string="string")
    validate_response(async_response, expected_response, expected_types)


async def test_test_patch(client: SeedExhaustive, async_client: AsyncSeedExhaustive) -> None:
    expected_response: typing.Any = {}
    expected_types: typing.Any = {
        "string": None,
        "integer": None,
        "long": None,
        "double": None,
        "bool": None,
        "datetime": None,
        "date": None,
        "uuid": None,
        "base64": None,
        "list": None,
        "set": None,
        "map": None,
        "bigint": None,
    }
    response = client.endpoints.http_methods.test_patch(id="id")
    validate_response(response, expected_response, expected_types)

    async_response = await async_client.endpoints.http_methods.test_patch(id="id")
    validate_response(async_response, expected_response, expected_types)


async def test_test_delete(client: SeedExhaustive, async_client: AsyncSeedExhaustive) -> None:
    expected_response: typing.Any = True
    expected_types: typing.Any = None
    response = client.endpoints.http_methods.test_delete(id="id")
    validate_response(response, expected_response, expected_types)

    async_response = await async_client.endpoints.http_methods.test_delete(id="id")
    validate_response(async_response, expected_response, expected_types)
