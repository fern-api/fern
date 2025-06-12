"""Tests to verify wire compatibility for the IMDb SDK client.

We verify wire compatibility against the API specification by:
    1. Setting up expectations for HTTP requests.
    2. Validating the exact request format.
    3. Returning a mocked response and verifying the client's handling.
"""

import difflib
import json
import pytest

from seed.imdb.errors import MovieDoesNotExistError
from seed.core.api_error import ApiError

from .mock_server import MockResponse
from .wire_test_base import WireTestBase


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


class TestGetMovie(WireTestBase):
    def test_get_movie_success(self):
        movie_id = "tt0482571"
        movie_data = {"id": movie_id, "title": "The Prestige", "rating": 8.5}

        self.expect_request(
            uri=f"/movies/{movie_id}",
            response=MockResponse(
                status_code=200,
                body=movie_data,
                headers={"Content-Type": "application/json"},
            ),
        )

        movie = self.client.imdb.get_movie(movie_id=movie_id)

        expected_response = json.dumps(movie_data)
        actual_response = movie.model_dump_json()

        assert_json_eq(expected_response, actual_response)

    def test_get_movie_not_found(self):
        movie_id = "tt0000000"

        self.expect_request(
            uri=f"/movies/{movie_id}",
            response=MockResponse(
                status_code=404,
                body=f'"{movie_id}"',
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(MovieDoesNotExistError) as exc_info:
            self.client.imdb.get_movie(movie_id=movie_id)
        assert exc_info.value.status_code == 404
        assert exc_info.value.body == movie_id

    def test_get_movie_server_error(self):
        movie_id = "tt0482571"
        error_response = {"error": "Internal server error"}

        self.expect_request(
            uri=f"/movies/{movie_id}",
            response=MockResponse(
                status_code=500,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            self.client.imdb.get_movie(movie_id=movie_id)
        assert exc_info.value.status_code == 500
        assert exc_info.value.body == error_response


# TODO: add TestCreateMovie tests
