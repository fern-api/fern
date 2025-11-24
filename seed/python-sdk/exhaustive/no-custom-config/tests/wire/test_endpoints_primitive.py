from typing import Optional, Dict, Any
from seed import SeedExhaustive

import pytest

import requests



@pytest.fixture(autouse=True)
def setup_client() -> None:
    """Reset WireMock before each test"""
    reset_wiremock_requests()


def reset_wiremock_requests() -> None:
    """Resets all WireMock request journal"""
    wiremock_admin_url = "http://localhost:8080/__admin"
    response = requests.delete(f"{wiremock_admin_url}/requests")
    assert response.status_code == 200, "Failed to reset WireMock requests"


def verify_request_count(
    method: str,
    url_path: str,
    query_params: Optional[Dict[str, str]],
    expected: int,
) -> None:
    """Verifies the number of requests made to WireMock"""
    wiremock_admin_url = "http://localhost:8080/__admin"
    request_body: Dict[str, Any] = {"method": method, "urlPath": url_path}
    if query_params:
            query_parameters = {k: {"equalTo": v} for k, v in query_params.items()}
            request_body["queryParameters"] = query_parameters
    response = requests.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"


def test_endpoints_primitive_get_and_return_string() -> None:
    """Test getAndReturnString endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.primitive.get_and_return_string(request="string")
    verify_request_count("POST", "/primitive/string", None, 1)


def test_endpoints_primitive_get_and_return_int() -> None:
    """Test getAndReturnInt endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.primitive.get_and_return_int(request=1)
    verify_request_count("POST", "/primitive/integer", None, 1)


def test_endpoints_primitive_get_and_return_long() -> None:
    """Test getAndReturnLong endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.primitive.get_and_return_long(request=1000000)
    verify_request_count("POST", "/primitive/long", None, 1)


def test_endpoints_primitive_get_and_return_double() -> None:
    """Test getAndReturnDouble endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.primitive.get_and_return_double(request=1.1)
    verify_request_count("POST", "/primitive/double", None, 1)


def test_endpoints_primitive_get_and_return_bool() -> None:
    """Test getAndReturnBool endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.primitive.get_and_return_bool(request=True)
    verify_request_count("POST", "/primitive/boolean", None, 1)


def test_endpoints_primitive_get_and_return_datetime() -> None:
    """Test getAndReturnDatetime endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.primitive.get_and_return_datetime(request="2024-01-15T09:30:00Z")
    verify_request_count("POST", "/primitive/datetime", None, 1)


def test_endpoints_primitive_get_and_return_date() -> None:
    """Test getAndReturnDate endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.primitive.get_and_return_date(request="2023-01-15")
    verify_request_count("POST", "/primitive/date", None, 1)


def test_endpoints_primitive_get_and_return_uuid() -> None:
    """Test getAndReturnUUID endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.primitive.get_and_return_uuid(request="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    verify_request_count("POST", "/primitive/uuid", None, 1)


def test_endpoints_primitive_get_and_return_base_64() -> None:
    """Test getAndReturnBase64 endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.primitive.get_and_return_base_64(request="SGVsbG8gd29ybGQh")
    verify_request_count("POST", "/primitive/base64", None, 1)

