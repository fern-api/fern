import difflib
import httpx
import json
import pytest
import pytest_asyncio

from seed import SeedApi, AsyncSeedApi

from .mock_server import MockServer, MockResponse


class _WireTestCommon:
    """Common utils for sync and async SDK wire compatibility testing."""

    def expect_request(
        self,
        uri: str,
        method: str = "GET",
        headers: dict | None = None,
        json_body: dict | None = None,
        response: MockResponse | None = None,
    ) -> None:
        if headers is None:
            headers = {"Authorization": "Bearer dummy-token"}
        self.mock_server.expect_request(
            uri=uri,
            method=method,
            headers=headers,
            json_body=json_body,
            response=response,
        )

    @staticmethod
    def assert_json_eq(expected: str, actual: str):
        # for ordering invariance and ease of diffing, re-serialize as sorted JSON
        def reserialize_as_ordered(json_obj: str):
            return json.dumps(json.loads(json_obj), indent=2, sort_keys=True)

        expected = reserialize_as_ordered(expected)
        actual = reserialize_as_ordered(actual)

        if expected != actual:
            diff = "\n".join(
                difflib.unified_diff(
                    expected.splitlines(),
                    actual.splitlines(),
                    fromfile="expected",
                    tofile="actual",
                    lineterm="",
                )
            )
            raise AssertionError(f"JSON mismatch:\n\n{diff}")


class WireTestBase(_WireTestCommon):
    """Base class for sync SDK wire compatibility testing."""

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


class AsyncWireTestBase(_WireTestCommon):
    """Base class for async SDK wire compatibility testing."""

    @pytest_asyncio.fixture(autouse=True)
    async def setup(self, mock_server: MockServer, base_url: str):
        """Setup common test fixtures."""
        self.mock_server = mock_server
        self.base_url = base_url
        self.client = await self._create_client()

    async def _create_client(self) -> AsyncSeedApi:
        """Create a test client with the given base URL."""
        return AsyncSeedApi(
            base_url=self.base_url,
            token="dummy-token",
            httpx_client=httpx.AsyncClient(),
        )
