"""
Pytest configuration for wire tests.

This module provides helpers for creating a configured client that talks to
WireMock and for verifying requests in WireMock.

The WireMock container lifecycle itself is managed by a top-level pytest
plugin (tests/conftest.py) so that the container is started exactly once
per test run, even when using pytest-xdist.
"""

import inspect
import os
import re
from typing import Any, Dict, List, Optional

import httpx

from seed.client import SeedEndpointSecurityAuth

# Check once at import time whether the client constructor accepts a headers kwarg.
try:
    _CLIENT_SUPPORTS_HEADERS: bool = "headers" in inspect.signature(SeedEndpointSecurityAuth).parameters
except (TypeError, ValueError):
    _CLIENT_SUPPORTS_HEADERS = False


def _get_wiremock_base_url() -> str:
    """Returns the WireMock base URL from the WIREMOCK_URL environment variable."""
    return os.environ.get("WIREMOCK_URL", "http://localhost:8080")


def get_client(test_id: str) -> SeedEndpointSecurityAuth:
    """
    Creates a configured client instance for wire tests.

    Args:
        test_id: Unique identifier for the test, used for request tracking.

    Returns:
        A configured client instance with all required auth parameters.
    """
    test_headers = {"X-Test-Id": test_id}
    base_url = _get_wiremock_base_url()

    if _CLIENT_SUPPORTS_HEADERS:
        return SeedEndpointSecurityAuth(
            base_url=base_url,
            headers=test_headers,
            api_key="test_api_key",
            client_id="test_client_id",
            client_secret="test_client_secret",
            username="test-username",
            password="test-password",
        )

    return SeedEndpointSecurityAuth(
        base_url=base_url,
        httpx_client=httpx.Client(headers=test_headers),
        api_key="test_api_key",
        client_id="test_client_id",
        client_secret="test_client_secret",
        username="test-username",
        password="test-password",
    )


def verify_request_count(
    test_id: str,
    method: str,
    url_path: str,
    query_params: Optional[Dict[str, Any]],
    expected: int,
) -> None:
    """Verifies the number of requests made to WireMock filtered by test ID for concurrency safety."""
    wiremock_admin_url = f"{_get_wiremock_base_url()}/__admin"
    request_body: Dict[str, Any] = {
        "method": method,
        "urlPath": url_path,
        "headers": {"X-Test-Id": {"equalTo": test_id}},
    }
    if query_params:
        query_parameters = {}
        for k, v in query_params.items():
            if isinstance(v, list):
                query_parameters[k] = {"hasExactly": [{"equalTo": item} for item in v]}
            else:
                query_parameters[k] = {"equalTo": v}
        request_body["queryParameters"] = query_parameters
    response = httpx.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"


def verify_auth_headers(
    test_id: str,
    method: str,
    url_path: str,
    present_headers: Dict[str, str],
    absent_headers: List[str],
) -> None:
    """Verifies the auth headers on the recorded request(s) for endpoint-security routing.

    'present_headers' maps a header name to a regex the header value must fully
    match; 'absent_headers' lists header names that must NOT be present. Header
    names are compared case-insensitively per HTTP semantics.

    This proves per-endpoint auth routing on the wire: only the scheme(s) declared
    for the endpoint send a header, and no other scheme's header leaks through.
    """
    wiremock_admin_url = f"{_get_wiremock_base_url()}/__admin"
    request_body: Dict[str, Any] = {
        "method": method,
        "urlPath": url_path,
        "headers": {"X-Test-Id": {"equalTo": test_id}},
    }
    response = httpx.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests = result.get("requests", [])
    assert len(requests) >= 1, f"Expected at least one recorded request for test_id={test_id}"

    for recorded in requests:
        raw_headers = recorded.get("headers", {}) or {}
        # WireMock may serialize a header value as a string or a list of strings;
        # normalize to a single string and index case-insensitively.
        normalized: Dict[str, str] = {}
        for name, value in raw_headers.items():
            if isinstance(value, list):
                value = value[0] if value else ""
            normalized[name.lower()] = str(value)

        for name, pattern in present_headers.items():
            actual = normalized.get(name.lower())
            assert actual is not None, (
                f"Expected auth header '{name}' to be present for test_id={test_id}, "
                f"but it was missing. Present headers: {sorted(normalized)}"
            )
            assert re.fullmatch(pattern, actual) is not None, (
                f"Auth header '{name}'='{actual}' did not match expected pattern '{pattern}' for test_id={test_id}"
            )

        for name in absent_headers:
            assert name.lower() not in normalized, (
                f"Expected auth header '{name}' to be ABSENT for test_id={test_id} "
                f"(endpoint-security routing must not leak other schemes), "
                f"but found '{normalized.get(name.lower())}'"
            )
