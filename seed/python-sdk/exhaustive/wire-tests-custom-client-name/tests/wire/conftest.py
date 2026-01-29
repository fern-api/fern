"""
Pytest configuration for wire tests.

This module provides helpers for creating a configured client that talks to
WireMock and for verifying requests in WireMock.

The WireMock container lifecycle itself is managed by a top-level pytest
plugin (wiremock_pytest_plugin.py) so that the container is started exactly
once per test run, even when using pytest-xdist.
"""

import inspect
import os
from typing import Any, Dict, Optional

import requests

from seed.client import Exhaustive


def _get_wiremock_base_url() -> str:
    """Returns the WireMock base URL using the dynamically assigned port."""
    port = os.environ.get("WIREMOCK_PORT", "8080")
    return f"http://localhost:{port}"


def get_client(test_id: str) -> Exhaustive:
    """
    Creates a configured client instance for wire tests.

    Args:
        test_id: Unique identifier for the test, used for request tracking.

    Returns:
        A configured client instance with all required auth parameters.
    """
    test_headers = {"X-Test-Id": test_id}
    base_url = _get_wiremock_base_url()

    # Prefer passing headers directly if the client constructor supports it.
    try:
        if "headers" in inspect.signature(Exhaustive).parameters:
            return Exhaustive(
                base_url=base_url,
                headers=test_headers,
                token="test_token",
            )
    except (TypeError, ValueError):
        pass

    import httpx

    return Exhaustive(
        base_url=base_url,
        httpx_client=httpx.Client(headers=test_headers),
        token="test_token",
    )


def verify_request_count(
    test_id: str,
    method: str,
    url_path: str,
    query_params: Optional[Dict[str, str]],
    expected: int,
) -> None:
    """Verifies the number of requests made to WireMock filtered by test ID for concurrency safety"""
    wiremock_admin_url = f"{_get_wiremock_base_url()}/__admin"
    request_body: Dict[str, Any] = {
        "method": method,
        "urlPath": url_path,
        "headers": {"X-Test-Id": {"equalTo": test_id}},
    }
    if query_params:
        query_parameters = {k: {"equalTo": v} for k, v in query_params.items()}
        request_body["queryParameters"] = query_parameters
    response = requests.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"
