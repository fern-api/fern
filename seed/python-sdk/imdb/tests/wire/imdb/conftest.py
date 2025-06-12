import pytest
from pytest_httpserver import HTTPServer
from tests.utils.wire.mock_server import MockServer


@pytest.fixture
def mock_server() -> MockServer:
    """
    Mock server, started before each test and stopped after.
    """
    server = HTTPServer()
    server.start()
    mock_server = MockServer(server)
    yield mock_server
    server.stop()


@pytest.fixture
def base_url(mock_server: MockServer) -> str:
    """
    Base URL for the mock server, to which the client sends requests and at which the
    server expects client requests.
    """
    return mock_server.server.url_for("") 