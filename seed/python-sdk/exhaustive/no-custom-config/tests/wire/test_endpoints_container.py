from typing import Optional, Dict, Any
from seed import SeedExhaustive

import pytest

import requests



def verify_request_count(
    test_id: str,
    method: str,
    url_path: str,
    query_params: Optional[Dict[str, str]],
    expected: int,
) -> None:
    """Verifies the number of requests made to WireMock filtered by test ID for concurrency safety"""
    wiremock_admin_url = "http://localhost:8080/__admin"
    request_body: Dict[str, Any] = {
            "method": method,
            "urlPath": url_path,
            "headers": {"X-Test-Id": {"equalTo": test_id}}
        }
    if query_params:
            query_parameters = {k: {"equalTo": v} for k, v in query_params.items()}
            request_body["queryParameters"] = query_parameters
    response = requests.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"


def test_endpoints_container_get_and_return_list_of_primitives() -> None:
    """Test getAndReturnListOfPrimitives endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_list_of_primitives.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.container.get_and_return_list_of_primitives(request=["string","string"])
    verify_request_count(test_id, "POST", "/container/list-of-primitives", None, 1)


def test_endpoints_container_get_and_return_list_of_objects() -> None:
    """Test getAndReturnListOfObjects endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_list_of_objects.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.container.get_and_return_list_of_objects(request=[{"string":"string"},{"string":"string"}])
    verify_request_count(test_id, "POST", "/container/list-of-objects", None, 1)


def test_endpoints_container_get_and_return_set_of_primitives() -> None:
    """Test getAndReturnSetOfPrimitives endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_set_of_primitives.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.container.get_and_return_set_of_primitives(request=["string"])
    verify_request_count(test_id, "POST", "/container/set-of-primitives", None, 1)


def test_endpoints_container_get_and_return_set_of_objects() -> None:
    """Test getAndReturnSetOfObjects endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_set_of_objects.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.container.get_and_return_set_of_objects(request=[{"string":"string"}])
    verify_request_count(test_id, "POST", "/container/set-of-objects", None, 1)


def test_endpoints_container_get_and_return_map_prim_to_prim() -> None:
    """Test getAndReturnMapPrimToPrim endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_map_prim_to_prim.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.container.get_and_return_map_prim_to_prim(request={"string":"string"})
    verify_request_count(test_id, "POST", "/container/map-prim-to-prim", None, 1)


def test_endpoints_container_get_and_return_map_of_prim_to_object() -> None:
    """Test getAndReturnMapOfPrimToObject endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_map_of_prim_to_object.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.container.get_and_return_map_of_prim_to_object(request={"string":{"string":"string"}})
    verify_request_count(test_id, "POST", "/container/map-prim-to-object", None, 1)


def test_endpoints_container_get_and_return_optional() -> None:
    """Test getAndReturnOptional endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_optional.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.container.get_and_return_optional(request={"string":"string"})
    verify_request_count(test_id, "POST", "/container/opt-objects", None, 1)

