"""
Shared test fixtures for the IMDB SDK tests.
"""
import pytest
from pytest_httpserver import HTTPServer
from .mock_server import MockServer


@pytest.fixture
def mock_server() -> MockServer:
    """
    Fixture that provides a mock HTTP server for testing.
    The server is started before each test and stopped after.
    """
    server = HTTPServer()
    server.start()
    mock_server = MockServer(server)
    yield mock_server
    server.stop()


@pytest.fixture
def base_url(mock_server: MockServer) -> str:
    """
    Fixture that provides the base URL for the mock server.
    """
    return mock_server.server.url_for("/imdb") 