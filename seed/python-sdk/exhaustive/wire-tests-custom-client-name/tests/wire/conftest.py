"""
Pytest configuration for wire tests.

This module provides helpers for creating a configured client that talks to
WireMock and for verifying requests in WireMock.

The WireMock container lifecycle itself is managed by a top-level pytest
plugin (wiremock_pytest_plugin.py) so that the container is started exactly
once per test run, even when using pytest-xdist.
"""

from typing import Any, Dict, Optional

import requests

from seed.client import Exhaustive


def get_client(test_id: str) -> Exhaustive:
    """
    Creates a configured client instance for wire tests.

    Args:
        test_id: Unique identifier for the test, used for request tracking.

    Returns:
        A configured client instance with all required auth parameters.
    """
    return Exhaustive(
        base_url="http://localhost:8080",
        headers={"X-Test-Id": test_id},
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
    wiremock_admin_url = "http://localhost:8080/__admin"
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
