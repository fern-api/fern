"""Tests to verify wire compatibility for the IMDb SDK client.

We verify wire compatibility against the API specification by:
    1. Setting up expectations for HTTP requests.
    2. Validating the exact request format.
    3. Returning a mocked response and verifying the client's handling.
"""

import difflib
import json
import httpx
import pytest

from seed.imdb.client import ImdbClient
from seed.imdb.errors import MovieDoesNotExistError

from seed.core.api_error import ApiError
from seed.core.client_wrapper import SyncClientWrapper

from .mock_server import MockServer, MockResponse


# TODO(rmehndiratta): Move this to a test utils package
def assert_json_eq(expected: str, actual: str):
    expected = json.loads(expected)
    actual = json.loads(actual)

    expected = json.dumps(expected, indent=2, sort_keys=True)
    actual = json.dumps(actual, indent=2, sort_keys=True)

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


class TestGetMovie:
    def test_get_movie_success(self, mock_server: MockServer, base_url: str):
        movie_id = "tt0482571"
        movie_data = {"id": movie_id, "title": "The Prestige", "rating": 8.5}

        mock_server.expect_request(
            uri=f"/imdb/movies/{movie_id}",
            method="GET",
            headers={"Authorization": "Bearer dummy-token"},
            response=MockResponse(
                status_code=200,
                body=movie_data,
                headers={"Content-Type": "application/json"},
            ),
        )

        client_wrapper = SyncClientWrapper(
            base_url=base_url, httpx_client=httpx.Client(), token="dummy-token"
        )
        client = ImdbClient(client_wrapper=client_wrapper)
        movie = client.get_movie(movie_id=movie_id)

        movie_data["rating"] = 8.9
        expected_response = json.dumps(movie_data)
        actual_response = movie.model_dump_json()

        assert_json_eq(expected_response, actual_response)

    def test_get_movie_not_found(self, mock_server: MockServer, base_url: str):
        movie_id = "tt0000000"

        mock_server.expect_request(
            uri=f"/imdb/movies/{movie_id}",
            method="GET",
            headers={"Authorization": "Bearer dummy-token"},
            response=MockResponse(
                status_code=404,
                body=f'"{movie_id}"',
                headers={"Content-Type": "application/json"},
            ),
        )

        client_wrapper = SyncClientWrapper(
            base_url=base_url, httpx_client=httpx.Client(), token="dummy-token"
        )
        client = ImdbClient(client_wrapper=client_wrapper)

        with pytest.raises(MovieDoesNotExistError) as exc_info:
            client.get_movie(movie_id=movie_id)
        assert exc_info.value.status_code == 404
        assert exc_info.value.body == movie_id

    def test_get_movie_server_error(self, mock_server: MockServer, base_url: str):
        movie_id = "tt0482571"
        error_response = {"error": "Internal server error"}

        mock_server.expect_request(
            uri=f"/imdb/movies/{movie_id}",
            method="GET",
            headers={"Authorization": "Bearer dummy-token"},
            response=MockResponse(
                status_code=500,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        client_wrapper = SyncClientWrapper(
            base_url=base_url, httpx_client=httpx.Client(), token="dummy-token"
        )
        client = ImdbClient(client_wrapper=client_wrapper)

        with pytest.raises(ApiError) as exc_info:
            client.get_movie(movie_id=movie_id)
        assert exc_info.value.status_code == 500
        assert exc_info.value.body == error_response


# TODO: add TestCreateMovie tests
