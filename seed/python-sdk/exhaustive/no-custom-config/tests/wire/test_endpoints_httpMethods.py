from typing import Optional, Dict, Any
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
def test_endpoints_httpMethods_test_get() -> None:
    """Test testGet endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.test_get("id")
    verify_request_count("GET", "/http-methods/id", None, 1)


@pytest.mark.asyncio
def test_endpoints_httpMethods_test_post() -> None:
    """Test testPost endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.test_post(request={"string":"string"})
    verify_request_count("POST", "/http-methods", None, 1)


@pytest.mark.asyncio
def test_endpoints_httpMethods_test_put() -> None:
    """Test testPut endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.test_put("id", request={"string":"string"})
    verify_request_count("PUT", "/http-methods/id", None, 1)


@pytest.mark.asyncio
def test_endpoints_httpMethods_test_patch() -> None:
    """Test testPatch endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.test_patch("id", request={"string":"string","integer":1,"long":1000000,"double":1.1,"bool":True,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"})
    verify_request_count("PATCH", "/http-methods/id", None, 1)


@pytest.mark.asyncio
def test_endpoints_httpMethods_test_delete() -> None:
    """Test testDelete endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.test_delete("id")
    verify_request_count("DELETE", "/http-methods/id", None, 1)

