import httpx
import pytest
import pytest_asyncio

from typing import Optional

# NB: rmehndiratta - we need to consider this in generation, what the client api classes
# are called
from seed import SeedUnions, AsyncSeedUnions

from .mock_server import MockServer, MockResponse


class _WireTestCommon:
    """Common utils for sync and async SDK wire compatibility testing."""

    def expect_request(
        self,
        uri: str,
        method: str = "GET",
        headers: dict | None = None,
        json_body: Optional[dict] = None,
        response: Optional[MockResponse] = None,
    ) -> None:
        self.mock_server.expect_request(
            uri=uri,
            method=method,
            headers=headers,
            json_body=json_body,
            response=response,
        )


class WireTestBase(_WireTestCommon):
    """Base class for sync SDK wire compatibility testing."""

    @pytest.fixture(autouse=True)
    def setup(self, mock_server: MockServer, base_url: str):
        self.mock_server = mock_server
        self.base_url = base_url
        self.client = self._create_client()

    def _create_client(self) -> SeedUnions:
        return SeedUnions(
            base_url=self.base_url,
            httpx_client=httpx.Client(),
        )


class AsyncWireTestBase(_WireTestCommon):
    """Base class for async SDK wire compatibility testing."""

    @pytest_asyncio.fixture(autouse=True)
    async def setup(self, mock_server: MockServer, base_url: str):
        self.mock_server = mock_server
        self.base_url = base_url
        self.client = await self._create_client()

    async def _create_client(self) -> AsyncSeedUnions:
        return AsyncSeedUnions(
            base_url=self.base_url,
            httpx_client=httpx.AsyncClient(),
        )
