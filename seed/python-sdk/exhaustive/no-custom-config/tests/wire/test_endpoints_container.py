from typing import Optional, Dict
from seed.exhaustive import SeedExhaustive

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
    request_body = {"method": method, "urlPath": url_path}
    if query_params:
            query_parameters = {k: {"equalTo": v} for k, v in query_params.items()}
            request_body["queryParameters"] = query_parameters
    response = requests.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"


@pytest.mark.asyncio
def test_endpoints_container_get_and_return_list_of_primitives() -> None:
    """Test getAndReturnListOfPrimitives endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_list_of_primitives(request=["string","string"])
    verify_request_count("POST", "/container/list-of-primitives", None, 1)


@pytest.mark.asyncio
def test_endpoints_container_get_and_return_list_of_objects() -> None:
    """Test getAndReturnListOfObjects endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_list_of_objects(request=[{"string":"string"},{"string":"string"}])
    verify_request_count("POST", "/container/list-of-objects", None, 1)


@pytest.mark.asyncio
def test_endpoints_container_get_and_return_set_of_primitives() -> None:
    """Test getAndReturnSetOfPrimitives endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_set_of_primitives(request=["string"])
    verify_request_count("POST", "/container/set-of-primitives", None, 1)


@pytest.mark.asyncio
def test_endpoints_container_get_and_return_set_of_objects() -> None:
    """Test getAndReturnSetOfObjects endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_set_of_objects(request=[{"string":"string"}])
    verify_request_count("POST", "/container/set-of-objects", None, 1)


@pytest.mark.asyncio
def test_endpoints_container_get_and_return_map_prim_to_prim() -> None:
    """Test getAndReturnMapPrimToPrim endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_map_prim_to_prim(request={"string":"string"})
    verify_request_count("POST", "/container/map-prim-to-prim", None, 1)


@pytest.mark.asyncio
def test_endpoints_container_get_and_return_map_of_prim_to_object() -> None:
    """Test getAndReturnMapOfPrimToObject endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_map_of_prim_to_object(request={"string":{"string":"string"}})
    verify_request_count("POST", "/container/map-prim-to-object", None, 1)


@pytest.mark.asyncio
def test_endpoints_container_get_and_return_optional() -> None:
    """Test getAndReturnOptional endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_optional(request={"string":"string"})
    verify_request_count("POST", "/container/opt-objects", None, 1)

