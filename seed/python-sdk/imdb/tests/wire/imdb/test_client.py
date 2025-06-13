"""Tests to verify wire compatibility for the IMDb SDK client.

We verify wire compatibility against the API specification by:
    1. Setting up expectations for HTTP requests.
    2. Validating the exact request format.
    3. Returning a mocked response and verifying the client's handling.
"""

import json
import pytest

from seed.imdb.errors import MovieDoesNotExistError
from seed.core.api_error import ApiError

from tests.utils.json_utils import assert_json_eq
from tests.utils.wire.mock_server import MockResponse
from tests.utils.wire.wire_test_base import WireTestBase, AsyncWireTestBase


class TestGetMovie(WireTestBase):
    def test_get_movie_success(self):
        # NB: this is from the examples service.yml / types.yml, not the imdb test
        # definition; but included here as an example of what a custom example should
        # look like threaded through into the wire tests
        movie_id = "movie-c06a4ad7"
        movie_data = {
            "id": movie_id,
            "prequel": "movie-cv9b914f",
            "title": "The Boy and the Heron",
            "from": "Hayao Miyazaki",
            "rating": 8.0,
            "type": "movie",
            "tag": "tag-12efs9dv",
            "metadata": {
                "actors": ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
                "releaseDate": "2023-12-08",
                "ratings": {"rottenTomatoes": 97, "imdb": 7.6},
            },
            "revenue": 1000000,
        }

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
        movie_id = "movie-c06a4ad7"

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
        movie_id = "movie-c06a4ad7"
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

        expected_response = json.dumps(error_response)
        actual_response = json.dumps(exc_info.value.body)

        assert_json_eq(expected_response, actual_response)


class TestCreateMovie(WireTestBase):
    def test_create_movie_success(self):
        movie_id = "movie-c06a4ad7"
        movie_data = {
            "title": "The Boy and the Heron",
            "rating": 8.0,
        }

        self.expect_request(
            uri="/movies/create-movie",
            method="POST",
            json_body=movie_data,
            response=MockResponse(
                status_code=200,
                body=f'"{movie_id}"',
                headers={"Content-Type": "application/json"},
            ),
        )

        response = self.client.imdb.create_movie(
            title=movie_data["title"],
            rating=movie_data["rating"],
        )

        assert response == movie_id

    def test_create_movie_validation_error(self):
        movie_data = {
            "title": "The Boy and the Heron",
            "rating": 11.0,  # Invalid rating > 10
        }
        error_response = {"error": "Rating must be between 0 and 10"}

        self.expect_request(
            uri="/movies/create-movie",
            method="POST",
            json_body=movie_data,
            response=MockResponse(
                status_code=400,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            self.client.imdb.create_movie(
                title=movie_data["title"],
                rating=movie_data["rating"],
            )
        assert exc_info.value.status_code == 400

        expected_response = json.dumps(error_response)
        actual_response = json.dumps(exc_info.value.body)

        assert_json_eq(expected_response, actual_response)

    def test_create_movie_server_error(self):
        movie_data = {
            "title": "The Boy and the Heron",
            "rating": 8.0,
        }
        error_response = {"error": "Internal server error"}

        self.expect_request(
            uri="/movies/create-movie",
            method="POST",
            json_body=movie_data,
            response=MockResponse(
                status_code=500,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            self.client.imdb.create_movie(
                title=movie_data["title"],
                rating=movie_data["rating"],
            )
        assert exc_info.value.status_code == 500

        expected_response = json.dumps(error_response)
        actual_response = json.dumps(exc_info.value.body)

        assert_json_eq(expected_response, actual_response)


class TestAsyncGetMovie(AsyncWireTestBase):
    @pytest.mark.asyncio
    async def test_get_movie_success(self):
        movie_id = "movie-c06a4ad7"
        movie_data = {
            "id": movie_id,
            "prequel": "movie-cv9b914f",
            "title": "The Boy and the Heron",
            "from": "Hayao Miyazaki",
            "rating": 8.0,
            "type": "movie",
            "tag": "tag-12efs9dv",
            "metadata": {
                "actors": ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
                "releaseDate": "2023-12-08",
                "ratings": {"rottenTomatoes": 97, "imdb": 7.6},
            },
            "revenue": 1000000,
        }

        self.expect_request(
            uri=f"/movies/{movie_id}",
            response=MockResponse(
                status_code=200,
                body=movie_data,
                headers={"Content-Type": "application/json"},
            ),
        )

        movie = await self.client.imdb.get_movie(movie_id=movie_id)

        expected_response = json.dumps(movie_data)
        actual_response = movie.model_dump_json()

        assert_json_eq(expected_response, actual_response)

    @pytest.mark.asyncio
    async def test_get_movie_not_found(self):
        movie_id = "movie-c06a4ad7"

        self.expect_request(
            uri=f"/movies/{movie_id}",
            response=MockResponse(
                status_code=404,
                body=f'"{movie_id}"',
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(MovieDoesNotExistError) as exc_info:
            await self.client.imdb.get_movie(movie_id=movie_id)
        assert exc_info.value.status_code == 404
        assert exc_info.value.body == movie_id

    @pytest.mark.asyncio
    async def test_get_movie_server_error(self):
        movie_id = "movie-c06a4ad7"
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
            await self.client.imdb.get_movie(movie_id=movie_id)
        assert exc_info.value.status_code == 500

        expected_response = json.dumps(error_response)
        actual_response = json.dumps(exc_info.value.body)

        assert_json_eq(expected_response, actual_response)


class TestAsyncCreateMovie(AsyncWireTestBase):
    @pytest.mark.asyncio
    async def test_create_movie_success(self):
        movie_id = "movie-c06a4ad7"
        movie_data = {
            "title": "The Boy and the Heron",
            "rating": 8.0,
        }

        self.expect_request(
            uri="/movies/create-movie",
            method="POST",
            json_body=movie_data,
            response=MockResponse(
                status_code=200,
                body=f'"{movie_id}"',
                headers={"Content-Type": "application/json"},
            ),
        )

        response = await self.client.imdb.create_movie(
            title=movie_data["title"],
            rating=movie_data["rating"],
        )

        assert response == movie_id

    @pytest.mark.asyncio
    async def test_create_movie_validation_error(self):
        movie_data = {
            "title": "The Boy and the Heron",
            "rating": 11.0,  # Invalid rating > 10
        }
        error_response = {"error": "Rating must be between 0 and 10"}

        self.expect_request(
            uri="/movies/create-movie",
            method="POST",
            json_body=movie_data,
            response=MockResponse(
                status_code=400,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            await self.client.imdb.create_movie(
                title=movie_data["title"],
                rating=movie_data["rating"],
            )
        assert exc_info.value.status_code == 400

        expected_response = json.dumps(error_response)
        actual_response = json.dumps(exc_info.value.body)

        assert_json_eq(expected_response, actual_response)

    @pytest.mark.asyncio
    async def test_create_movie_server_error(self):
        movie_data = {
            "title": "The Boy and the Heron",
            "rating": 8.0,
        }
        error_response = {"error": "Internal server error"}

        self.expect_request(
            uri="/movies/create-movie",
            method="POST",
            json_body=movie_data,
            response=MockResponse(
                status_code=500,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            await self.client.imdb.create_movie(
                title=movie_data["title"],
                rating=movie_data["rating"],
            )
        assert exc_info.value.status_code == 500

        expected_response = json.dumps(error_response)
        actual_response = json.dumps(exc_info.value.body)

        assert_json_eq(expected_response, actual_response)
