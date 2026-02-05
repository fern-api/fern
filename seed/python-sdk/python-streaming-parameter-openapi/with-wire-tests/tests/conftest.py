"""
Pytest plugin that manages the WireMock container lifecycle for wire tests.

This plugin is loaded globally for the test suite and is responsible for
starting and stopping the WireMock container exactly once per test run,
including when running with pytest-xdist over the entire project.

It lives under tests/ (as tests/conftest.py) and is discovered automatically
by pytest's normal test collection rules.
"""

import os
import subprocess

import pytest

_STARTED: bool = False
_WIREMOCK_PORT: str = "8080"  # Default, will be updated after container starts


def _compose_file() -> str:
    """Returns the path to the docker-compose file for WireMock."""
    # This file lives in tests/conftest.py, so the project root is the parent of tests.
    tests_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(tests_dir, ".."))
    wiremock_dir = os.path.join(project_root, "wiremock")
    return os.path.join(wiremock_dir, "docker-compose.test.yml")


def _project_name() -> str:
    """Returns a unique project name for this test fixture to avoid container name conflicts."""
    tests_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(tests_dir, ".."))
    # Use the last two directory names to create a unique project name
    # e.g., "python-streaming-parameter-openapi-with-wire-tests"
    parent = os.path.basename(os.path.dirname(project_root))
    current = os.path.basename(project_root)
    return f"{parent}-{current}".replace("_", "-").lower()


def _get_wiremock_port() -> str:
    """Gets the dynamically assigned port for the WireMock container."""
    compose_file = _compose_file()
    project = _project_name()
    try:
        result = subprocess.run(
            ["docker", "compose", "-f", compose_file, "-p", project, "port", "wiremock", "8080"],
            check=True,
            capture_output=True,
            text=True,
        )
        # Output is like "0.0.0.0:32768" or "[::]:32768"
        port = result.stdout.strip().split(":")[-1]
        return port
    except subprocess.CalledProcessError:
        return "8080"  # Fallback to default


def _start_wiremock() -> None:
    """Starts the WireMock container using docker-compose."""
    global _STARTED, _WIREMOCK_PORT
    if _STARTED:
        return

    compose_file = _compose_file()
    project = _project_name()
    print(f"\nStarting WireMock container (project: {project})...")
    try:
        subprocess.run(
            ["docker", "compose", "-f", compose_file, "-p", project, "up", "-d", "--wait"],
            check=True,
            capture_output=True,
            text=True,
        )
        _WIREMOCK_PORT = _get_wiremock_port()
        os.environ["WIREMOCK_PORT"] = _WIREMOCK_PORT
        print(f"WireMock container is ready on port {_WIREMOCK_PORT}")
        _STARTED = True
    except subprocess.CalledProcessError as e:
        print(f"Failed to start WireMock: {e.stderr}")
        raise


def _stop_wiremock() -> None:
    """Stops and removes the WireMock container."""
    compose_file = _compose_file()
    project = _project_name()
    print("\nStopping WireMock container...")
    subprocess.run(
        ["docker", "compose", "-f", compose_file, "-p", project, "down", "-v"],
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
    if _is_xdist_worker(config):
        # Workers never manage the container lifecycle.
        return

    _start_wiremock()


def pytest_unconfigure(config: pytest.Config) -> None:
    """
    Pytest hook that runs during test session teardown.

    Stops WireMock container only from the controller process (xdist)
    or the single process (non-xdist). This ensures the container is
    cleaned up after all workers have finished.
    """
    if _is_xdist_worker(config):
        # Workers never manage the container lifecycle.
        return

    _stop_wiremock()
