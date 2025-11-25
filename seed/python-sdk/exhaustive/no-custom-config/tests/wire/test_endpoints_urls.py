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


def test_endpoints_urls_with_mixed_case() -> None:
    """Test withMixedCase endpoint with WireMock"""
    test_id = "endpoints.urls.with_mixed_case.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.urls.with_mixed_case()
    verify_request_count(test_id, "GET", "/urls/MixedCase", None, 1)


def test_endpoints_urls_no_ending_slash() -> None:
    """Test noEndingSlash endpoint with WireMock"""
    test_id = "endpoints.urls.no_ending_slash.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.urls.no_ending_slash()
    verify_request_count(test_id, "GET", "/urls/no-ending-slash", None, 1)


def test_endpoints_urls_with_ending_slash() -> None:
    """Test withEndingSlash endpoint with WireMock"""
    test_id = "endpoints.urls.with_ending_slash.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.urls.with_ending_slash()
    verify_request_count(test_id, "GET", "/urls/with-ending-slash/", None, 1)


def test_endpoints_urls_with_underscores() -> None:
    """Test withUnderscores endpoint with WireMock"""
    test_id = "endpoints.urls.with_underscores.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.urls.with_underscores()
    verify_request_count(test_id, "GET", "/urls/with_underscores", None, 1)

