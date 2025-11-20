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
def test_endpoints_params_get_with_path() -> None:
    """Test getWithPath endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_with_path("param")
    verify_request_count("GET", "/params/path/param", None, 1)


@pytest.mark.asyncio
def test_endpoints_params_get_with_inline_path() -> None:
    """Test getWithInlinePath endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_with_inline_path("param")
    verify_request_count("GET", "/params/path/param", None, 1)


@pytest.mark.asyncio
def test_endpoints_params_get_with_query() -> None:
    """Test getWithQuery endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_with_query(query="query", number=1)
    verify_request_count("GET", "/params", {"query": "query", "number": "1"}, 1)


@pytest.mark.asyncio
def test_endpoints_params_get_with_allow_multiple_query() -> None:
    """Test getWithAllowMultipleQuery endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_with_allow_multiple_query(query="query", number=1)
    verify_request_count("GET", "/params", {"query": "query", "number": "1"}, 1)


@pytest.mark.asyncio
def test_endpoints_params_get_with_path_and_query() -> None:
    """Test getWithPathAndQuery endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_with_path_and_query("param", query="query")
    verify_request_count("GET", "/params/path-query/param", {"query": "query"}, 1)


@pytest.mark.asyncio
def test_endpoints_params_get_with_inline_path_and_query() -> None:
    """Test getWithInlinePathAndQuery endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.get_with_inline_path_and_query("param", query="query")
    verify_request_count("GET", "/params/path-query/param", {"query": "query"}, 1)


@pytest.mark.asyncio
def test_endpoints_params_modify_with_path() -> None:
    """Test modifyWithPath endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.modify_with_path("param")
    verify_request_count("PUT", "/params/path/param", None, 1)


@pytest.mark.asyncio
def test_endpoints_params_modify_with_inline_path() -> None:
    """Test modifyWithInlinePath endpoint with WireMock"""
    client = SeedExhaustive(base_url="http://localhost:8080")
    result = client.modify_with_inline_path("param")
    verify_request_count("PUT", "/params/path/param", None, 1)

