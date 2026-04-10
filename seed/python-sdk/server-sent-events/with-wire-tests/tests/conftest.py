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
_EXTERNAL: bool = False  # True when using an external WireMock instance (skip container lifecycle)
_WIREMOCK_URL: str = "http://localhost:8080"  # Default, will be updated after container starts
_PROJECT_NAME: str = "seed-server-sent-events"

# This file lives at tests/conftest.py, so the project root is one level up.
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_COMPOSE_FILE = os.path.join(_PROJECT_ROOT, "wiremock", "docker-compose.test.yml")


def _get_wiremock_port() -> str:
    """Gets the dynamically assigned port for the WireMock container."""
    try:
        result = subprocess.run(
            ["docker", "compose", "-f", _COMPOSE_FILE, "-p", _PROJECT_NAME, "port", "wiremock", "8080"],
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
    global _STARTED, _EXTERNAL, _WIREMOCK_URL
    if _STARTED:
        return

    # If WIREMOCK_URL is already set (e.g., by CI/CD pipeline), skip container management
    existing_url = os.environ.get("WIREMOCK_URL")
    if existing_url:
        _WIREMOCK_URL = existing_url
        _EXTERNAL = True
        _STARTED = True
        print(f"\nUsing external WireMock at {_WIREMOCK_URL} (container management skipped)")
        return

    print(f"\nStarting WireMock container (project: {_PROJECT_NAME})...")
    try:
        subprocess.run(
            ["docker", "compose", "-f", _COMPOSE_FILE, "-p", _PROJECT_NAME, "up", "-d", "--wait"],
            check=True,
            capture_output=True,
            text=True,
        )
        _WIREMOCK_PORT = _get_wiremock_port()
        _WIREMOCK_URL = f"http://localhost:{_WIREMOCK_PORT}"
        os.environ["WIREMOCK_URL"] = _WIREMOCK_URL
        print(f"WireMock container is ready at {_WIREMOCK_URL}")
        _STARTED = True
    except subprocess.CalledProcessError as e:
        print(f"Failed to start WireMock: {e.stderr}")
        raise


def _stop_wiremock() -> None:
    """Stops and removes the WireMock container."""
    if _EXTERNAL:
        # Container is managed externally; nothing to tear down.
        return

    print("\nStopping WireMock container...")
    subprocess.run(
        ["docker", "compose", "-f", _COMPOSE_FILE, "-p", _PROJECT_NAME, "down", "-v"],
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


def _has_httpx_aiohttp() -> bool:
    """Check if httpx_aiohttp is importable."""
    try:
        import httpx_aiohttp  # type: ignore[import-not-found]  # noqa: F401

        return True
    except ImportError:
        return False


def pytest_collection_modifyitems(config: pytest.Config, items: list) -> None:
    """Auto-skip @pytest.mark.aiohttp tests when httpx_aiohttp is not installed."""
    if _has_httpx_aiohttp():
        return
    skip_aiohttp = pytest.mark.skip(reason="httpx_aiohttp not installed")
    for item in items:
        if "aiohttp" in item.keywords:
            item.add_marker(skip_aiohttp)


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
