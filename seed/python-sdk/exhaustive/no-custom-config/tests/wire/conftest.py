"""
Pytest configuration for wire tests.

This module manages the WireMock container lifecycle for integration tests.
"""
import os
import subprocess
import pytest


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
            ["docker", "compose", "-f", compose_file, "up", "-d", "--wait"],
            check=True,
            capture_output=True,
            text=True
        )
        print("WireMock container is ready")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start WireMock: {e.stderr}")
        raise

    # Yield control to tests
    yield

    # Cleanup: stop and remove the container
    print("\nStopping WireMock container...")
    subprocess.run(
        ["docker", "compose", "-f", compose_file, "down", "-v"],
        check=False,
        capture_output=True
    )
