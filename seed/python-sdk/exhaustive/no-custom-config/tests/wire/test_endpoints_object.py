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


@pytest.mark.asyncio
def test_endpoints_object_get_and_return_with_optional_field() -> None:
    """Test getAndReturnWithOptionalField endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.object.get_and_return_with_optional_field(request={"string":"string","integer":1,"long":1000000,"double":1.1,"bool":True,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"})
    verify_request_count("POST", "/object/get-and-return-with-optional-field", None, 1)


@pytest.mark.asyncio
def test_endpoints_object_get_and_return_with_required_field() -> None:
    """Test getAndReturnWithRequiredField endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.object.get_and_return_with_required_field(request={"string":"string"})
    verify_request_count("POST", "/object/get-and-return-with-required-field", None, 1)


@pytest.mark.asyncio
def test_endpoints_object_get_and_return_with_map_of_map() -> None:
    """Test getAndReturnWithMapOfMap endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.object.get_and_return_with_map_of_map(request={"map":{"map":{"map":"map"}}})
    verify_request_count("POST", "/object/get-and-return-with-map-of-map", None, 1)


@pytest.mark.asyncio
def test_endpoints_object_get_and_return_nested_with_optional_field() -> None:
    """Test getAndReturnNestedWithOptionalField endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.object.get_and_return_nested_with_optional_field(request={"string":"string","NestedObject":{"string":"string","integer":1,"long":1000000,"double":1.1,"bool":True,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"}})
    verify_request_count("POST", "/object/get-and-return-nested-with-optional-field", None, 1)


@pytest.mark.asyncio
def test_endpoints_object_get_and_return_nested_with_required_field() -> None:
    """Test getAndReturnNestedWithRequiredField endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.object.get_and_return_nested_with_required_field("string", request={"string":"string","NestedObject":{"string":"string","integer":1,"long":1000000,"double":1.1,"bool":True,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"}})
    verify_request_count("POST", "/object/get-and-return-nested-with-required-field/string", None, 1)


@pytest.mark.asyncio
def test_endpoints_object_get_and_return_nested_with_required_field_as_list() -> None:
    """Test getAndReturnNestedWithRequiredFieldAsList endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.endpoints.object.get_and_return_nested_with_required_field_as_list(request=[{"string":"string","NestedObject":{"string":"string","integer":1,"long":1000000,"double":1.1,"bool":True,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"}},{"string":"string","NestedObject":{"string":"string","integer":1,"long":1000000,"double":1.1,"bool":True,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"}}])
    verify_request_count("POST", "/object/get-and-return-nested-with-required-field-list", None, 1)

