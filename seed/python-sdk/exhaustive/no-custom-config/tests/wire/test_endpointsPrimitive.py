import datetime

from .conftest import get_client, verify_request_count


def test_endpointsPrimitive_endpoints_primitive_get_and_return_string() -> None:
    """Test endpoints_primitive_getAndReturnString endpoint with WireMock"""
    test_id = "endpoints_primitive.endpoints_primitive_get_and_return_string.0"
    client = get_client(test_id)
    client.endpoints_primitive.endpoints_primitive_get_and_return_string(
        request="string",
    )
    verify_request_count(test_id, "POST", "/primitive/string", None, 1)


def test_endpointsPrimitive_endpoints_primitive_get_and_return_int() -> None:
    """Test endpoints_primitive_getAndReturnInt endpoint with WireMock"""
    test_id = "endpoints_primitive.endpoints_primitive_get_and_return_int.0"
    client = get_client(test_id)
    client.endpoints_primitive.endpoints_primitive_get_and_return_int(
        request=1,
    )
    verify_request_count(test_id, "POST", "/primitive/integer", None, 1)


def test_endpointsPrimitive_endpoints_primitive_get_and_return_long() -> None:
    """Test endpoints_primitive_getAndReturnLong endpoint with WireMock"""
    test_id = "endpoints_primitive.endpoints_primitive_get_and_return_long.0"
    client = get_client(test_id)
    client.endpoints_primitive.endpoints_primitive_get_and_return_long(
        request=1000000,
    )
    verify_request_count(test_id, "POST", "/primitive/long", None, 1)


def test_endpointsPrimitive_endpoints_primitive_get_and_return_double() -> None:
    """Test endpoints_primitive_getAndReturnDouble endpoint with WireMock"""
    test_id = "endpoints_primitive.endpoints_primitive_get_and_return_double.0"
    client = get_client(test_id)
    client.endpoints_primitive.endpoints_primitive_get_and_return_double(
        request=1.1,
    )
    verify_request_count(test_id, "POST", "/primitive/double", None, 1)


def test_endpointsPrimitive_endpoints_primitive_get_and_return_bool() -> None:
    """Test endpoints_primitive_getAndReturnBool endpoint with WireMock"""
    test_id = "endpoints_primitive.endpoints_primitive_get_and_return_bool.0"
    client = get_client(test_id)
    client.endpoints_primitive.endpoints_primitive_get_and_return_bool(
        request=True,
    )
    verify_request_count(test_id, "POST", "/primitive/boolean", None, 1)


def test_endpointsPrimitive_endpoints_primitive_get_and_return_datetime() -> None:
    """Test endpoints_primitive_getAndReturnDatetime endpoint with WireMock"""
    test_id = "endpoints_primitive.endpoints_primitive_get_and_return_datetime.0"
    client = get_client(test_id)
    client.endpoints_primitive.endpoints_primitive_get_and_return_datetime(
        request=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    )
    verify_request_count(test_id, "POST", "/primitive/datetime", None, 1)


def test_endpointsPrimitive_endpoints_primitive_get_and_return_date() -> None:
    """Test endpoints_primitive_getAndReturnDate endpoint with WireMock"""
    test_id = "endpoints_primitive.endpoints_primitive_get_and_return_date.0"
    client = get_client(test_id)
    client.endpoints_primitive.endpoints_primitive_get_and_return_date(
        request=datetime.date.fromisoformat("2023-01-15"),
    )
    verify_request_count(test_id, "POST", "/primitive/date", None, 1)


def test_endpointsPrimitive_endpoints_primitive_get_and_return_uuid() -> None:
    """Test endpoints_primitive_getAndReturnUUID endpoint with WireMock"""
    test_id = "endpoints_primitive.endpoints_primitive_get_and_return_uuid.0"
    client = get_client(test_id)
    client.endpoints_primitive.endpoints_primitive_get_and_return_uuid(
        request="string",
    )
    verify_request_count(test_id, "POST", "/primitive/uuid", None, 1)


def test_endpointsPrimitive_endpoints_primitive_get_and_return_base64() -> None:
    """Test endpoints_primitive_getAndReturnBase64 endpoint with WireMock"""
    test_id = "endpoints_primitive.endpoints_primitive_get_and_return_base64.0"
    client = get_client(test_id)
    client.endpoints_primitive.endpoints_primitive_get_and_return_base64(
        request="string",
    )
    verify_request_count(test_id, "POST", "/primitive/base64", None, 1)
