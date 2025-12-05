"""
Pytest configuration for wire tests.

This module manages the WireMock container lifecycle for integration tests.
It is compatible with pytest-xdist parallelization by ensuring only the
controller process (or the single process in non-xdist runs) starts and
stops the WireMock container.
"""

import os
import subprocess
from typing import Any, Dict, Optional

import pytest
import requests

from seed.client import SeedExhaustive


def _compose_file() -> str:
    """Returns the path to the docker-compose file for WireMock."""
    test_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(test_dir, "..", ".."))
    wiremock_dir = os.path.join(project_root, "wiremock")
    return os.path.join(wiremock_dir, "docker-compose.test.yml")


def _start_wiremock() -> None:
    """Starts the WireMock container using docker-compose."""
    compose_file = _compose_file()
    print("\nStarting WireMock container...")
    try:
        subprocess.run(
            ["docker", "compose", "-f", compose_file, "up", "-d", "--wait"],
            check=True,
            capture_output=True,
            text=True,
        )
        print("WireMock container is ready")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start WireMock: {e.stderr}")
        raise


def _stop_wiremock() -> None:
    """Stops and removes the WireMock container."""
    compose_file = _compose_file()
    print("\nStopping WireMock container...")
    subprocess.run(
        ["docker", "compose", "-f", compose_file, "down", "-v"],
        check=False,
        capture_output=True,
    )


def _is_xdist_worker(config: pytest.Config) -> bool:
    """
    Determines if the current process is an xdist worker.

    In pytest-xdist, worker processes have a 'workerinput' attribute
    on the config object, while the controller process does not.
    """
    return hasattr(config, "workerinput")


def pytest_configure(config: pytest.Config) -> None:
    """
    Pytest hook that runs during test session setup.

    Starts WireMock container only from the controller process (xdist)
    or the single process (non-xdist). This ensures only one container
    is started regardless of the number of worker processes.
    """
    if not _is_xdist_worker(config):
        _start_wiremock()


def pytest_unconfigure(config: pytest.Config) -> None:
    """
    Pytest hook that runs during test session teardown.

    Stops WireMock container only from the controller process (xdist)
    or the single process (non-xdist). This ensures the container is
    cleaned up after all workers have finished.
    """
    if not _is_xdist_worker(config):
        _stop_wiremock()


def get_client(test_id: str) -> SeedExhaustive:
    """
    Creates a configured client instance for wire tests.

    Args:
        test_id: Unique identifier for the test, used for request tracking.

    Returns:
        A configured client instance with all required auth parameters.
    """
    return SeedExhaustive(
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
