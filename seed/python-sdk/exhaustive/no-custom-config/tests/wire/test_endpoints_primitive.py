from seed import SeedExhaustive
from conftest import verify_request_count

import pytest

from datetime import datetime, date

from uuid import UUID



def test_endpoints_primitive_get_and_return_string() -> None:
    """Test getAndReturnString endpoint with WireMock"""
    test_id = "endpoints.primitive.get_and_return_string.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.primitive.get_and_return_string(
        request="string"
    )
    verify_request_count(test_id, "POST", "/primitive/string", None, 1)


def test_endpoints_primitive_get_and_return_int() -> None:
    """Test getAndReturnInt endpoint with WireMock"""
    test_id = "endpoints.primitive.get_and_return_int.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.primitive.get_and_return_int(
        request=1
    )
    verify_request_count(test_id, "POST", "/primitive/integer", None, 1)


def test_endpoints_primitive_get_and_return_long() -> None:
    """Test getAndReturnLong endpoint with WireMock"""
    test_id = "endpoints.primitive.get_and_return_long.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.primitive.get_and_return_long(
        request=1000000
    )
    verify_request_count(test_id, "POST", "/primitive/long", None, 1)


def test_endpoints_primitive_get_and_return_double() -> None:
    """Test getAndReturnDouble endpoint with WireMock"""
    test_id = "endpoints.primitive.get_and_return_double.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.primitive.get_and_return_double(
        request=1.1
    )
    verify_request_count(test_id, "POST", "/primitive/double", None, 1)


def test_endpoints_primitive_get_and_return_bool() -> None:
    """Test getAndReturnBool endpoint with WireMock"""
    test_id = "endpoints.primitive.get_and_return_bool.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.primitive.get_and_return_bool(
        request=True
    )
    verify_request_count(test_id, "POST", "/primitive/boolean", None, 1)


def test_endpoints_primitive_get_and_return_datetime() -> None:
    """Test getAndReturnDatetime endpoint with WireMock"""
    test_id = "endpoints.primitive.get_and_return_datetime.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.primitive.get_and_return_datetime(
        request=datetime.fromisoformat("2024-01-15T09:30:00Z")
    )
    verify_request_count(test_id, "POST", "/primitive/datetime", None, 1)


def test_endpoints_primitive_get_and_return_date() -> None:
    """Test getAndReturnDate endpoint with WireMock"""
    test_id = "endpoints.primitive.get_and_return_date.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.primitive.get_and_return_date(
        request=date.fromisoformat("2023-01-15")
    )
    verify_request_count(test_id, "POST", "/primitive/date", None, 1)


def test_endpoints_primitive_get_and_return_uuid() -> None:
    """Test getAndReturnUUID endpoint with WireMock"""
    test_id = "endpoints.primitive.get_and_return_uuid.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.primitive.get_and_return_uuid(
        request=UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    )
    verify_request_count(test_id, "POST", "/primitive/uuid", None, 1)


def test_endpoints_primitive_get_and_return_base_64() -> None:
    """Test getAndReturnBase64 endpoint with WireMock"""
    test_id = "endpoints.primitive.get_and_return_base_64.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.primitive.get_and_return_base_64(
        request="SGVsbG8gd29ybGQh"
    )
    verify_request_count(test_id, "POST", "/primitive/base64", None, 1)

