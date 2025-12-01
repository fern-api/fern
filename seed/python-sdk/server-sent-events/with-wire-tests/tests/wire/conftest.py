"""
Pytest configuration for wire tests.

This module manages the WireMock container lifecycle for integration tests.
"""

import os
import subprocess
from typing import Any, Dict, Optional

import pytest
import requests

from seed.client import SeedServerSentEvents


@pytest.fixture(scope="session", autouse=True)
def wiremock_container():
    """
    Session-scoped fixture that starts WireMock container before tests
    and cleans it up after all tests complete.

    The docker-compose healthcheck ensures WireMock is ready before tests run.
    """
    # Get the directory containing the docker-compose file
    test_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(test_dir, "..", ".."))
    wiremock_dir = os.path.join(project_root, "wiremock")

    compose_file = os.path.join(wiremock_dir, "docker-compose.test.yml")

    # Start WireMock container (--wait ensures healthcheck passes before returning)
    print("\nStarting WireMock container...")
    try:
        subprocess.run(
            ["docker", "compose", "-f", compose_file, "up", "-d", "--wait"], check=True, capture_output=True, text=True
        )
        print("WireMock container is ready")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start WireMock: {e.stderr}")
        raise

    # Yield control to tests
    yield

    # Cleanup: stop and remove the container
    print("\nStopping WireMock container...")
    subprocess.run(["docker", "compose", "-f", compose_file, "down", "-v"], check=False, capture_output=True)


def get_client(test_id: str) -> SeedServerSentEvents:
    """
    Creates a configured client instance for wire tests.

    Args:
        test_id: Unique identifier for the test, used for request tracking.

    Returns:
        A configured client instance with all required auth parameters.
    """
    return SeedServerSentEvents(
        base_url="http://localhost:8080",
        headers={"X-Test-Id": test_id},
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
