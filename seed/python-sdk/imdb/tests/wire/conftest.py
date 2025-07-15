import pytest
from seed import AsyncSeedApi, SeedApi

BASE_URL = "https://example.test"

@pytest.fixture
def base_url() -> str:
    """Return the base URL for the test environment"""
    return BASE_URL

@pytest.fixture
def client() -> SeedApi:
    """Create a sync client for testing"""
    return SeedApi(
        token="test_token",
        base_url=BASE_URL
    )


@pytest.fixture
def async_client() -> AsyncSeedApi:
    """Create an async client for testing"""
    return AsyncSeedApi(
        token="test_token", 
        base_url=BASE_URL
    ) 
