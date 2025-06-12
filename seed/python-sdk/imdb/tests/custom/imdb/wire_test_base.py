import httpx
import pytest

from seed import SeedApi

from .mock_server import MockServer, MockResponse


# TODO rmehndiratta: think about where to put this; probably in test utils way up
class WireTestBase:
    """Base class for SDK wire compatibility testing"""

    @pytest.fixture(autouse=True)
    def setup(self, mock_server: MockServer, base_url: str):
        """Setup common test fixtures."""
        self.mock_server = mock_server
        self.base_url = base_url
        self.client = self._create_client()

    def _create_client(self) -> SeedApi:
        """Create a test client with the given base URL."""
        return SeedApi(
            base_url=self.base_url,
            token="dummy-token",
            httpx_client=httpx.Client(),
        )

    def expect_request(
        self,
        uri: str,
        method: str = "GET",
        headers: dict | None = None,
        response: MockResponse | None = None,
    ) -> None:
        """Helper method to set up mock server expectations."""
        if headers is None:
            headers = {"Authorization": "Bearer dummy-token"}
        self.mock_server.expect_request(
            uri=uri,
            method=method,
            headers=headers,
            response=response,
        )
