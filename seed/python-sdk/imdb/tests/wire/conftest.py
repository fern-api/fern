import pytest
from seed import AsyncSeedApi, SeedApi

from .mock_server import MockServer, MockServerPool


# module-level instance for test session
_mock_server_pool = MockServerPool()


@pytest.fixture(scope="function")
def mock_server() -> MockServer:
    """Create a mock server for wire tests"""
    return _mock_server_pool.create_server()


@pytest.fixture
def client(mock_server: MockServer) -> SeedApi:
    """Create a sync client pointing to mock server"""
    return SeedApi(
        token="test_token",
        base_url=mock_server.base_url
    )


@pytest.fixture
def async_client(mock_server: MockServer) -> AsyncSeedApi:
    """Create an async client pointing to mock server"""
    return AsyncSeedApi(
        token="test_token", 
        base_url=mock_server.base_url
    )


@pytest.fixture(scope="session", autouse=True)
def setup_mock_server_pool():
    """Setup and teardown the mock server pool for all tests"""
    _mock_server_pool.listen()
    yield
    _mock_server_pool.close() 
