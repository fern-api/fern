import httpx
import respx

from seed import AsyncSeedApi, SeedApi


class TestImdbWire:
    """Wire tests for IMDB endpoints using sync client"""

    @respx.mock
    def test_create_movie(self, client: SeedApi, base_url: str) -> None:
        """Test create_movie endpoint with wire test"""

        # mock endpoint
        expected_url = f"{base_url}/movies/create-movie"
        expected_json = {"title": "title", "rating": 1.1}
        expected_response = httpx.Response(
            200,
            json="string",
            headers={"content-type": "application/json"}
        )
        create_movie_mock = respx.post(expected_url, json=expected_json).mock(
            return_value=expected_response
        )

        # make request
        response = client.imdb.create_movie(
            title="title",
            rating=1.1
        )

        # verify response
        assert response == "string"

        # verify request was made
        assert create_movie_mock.called
        assert create_movie_mock.call_count == 1

    @respx.mock
    def test_get_movie(self, client: SeedApi, base_url: str) -> None:
        """Test get_movie endpoint with wire test"""

        response_body = {
            "id": "id",
            "title": "title",
            "rating": 1.1
        }

        # mock endpoint
        expected_url = f"{base_url}/movies/movieId"
        expected_response = httpx.Response(
            200,
            json=response_body,
            headers={"content-type": "application/json"}
        )
        get_movie_mock = respx.get(expected_url).mock(
            return_value=expected_response
        )

        # make request
        response = client.imdb.get_movie("movieId")

        # verify response
        assert response.id == "id"
        assert response.title == "title"
        assert response.rating == 1.1

        # verify request was made
        assert get_movie_mock.called
        assert get_movie_mock.call_count == 1


class TestImdbWireAsync:
    """Wire tests for IMDB endpoints using async client"""

    @respx.mock
    async def test_create_movie_async(self, async_client: AsyncSeedApi, base_url: str) -> None:
        """Test async create_movie endpoint with wire test"""

        # mock endpoint
        expected_url = f"{base_url}/movies/create-movie"
        expected_response = httpx.Response(
            200,
            json="string",
            headers={"content-type": "application/json"}
        )
        create_movie_mock = respx.post(expected_url).mock(
            return_value=expected_response
        )

        # make request
        response = await async_client.imdb.create_movie(
            title="title",
            rating=1.1
        )

        # verify response
        assert response == "string"

        # verify request was made
        assert create_movie_mock.called
        assert create_movie_mock.call_count == 1

    @respx.mock
    async def test_get_movie_async(self, async_client: AsyncSeedApi, base_url: str) -> None:
        """Test async get_movie endpoint with wire test"""

        response_body = {
            "id": "id",
            "title": "title",
            "rating": 1.1
        }

        # mock endpoint
        expected_url = f"{base_url}/movies/movieId"
        expected_response = httpx.Response(
            200,
            json=response_body,
            headers={"content-type": "application/json"}
        )
        get_movie_mock = respx.get(expected_url).mock(
            return_value=expected_response
        )

        # make request
        response = await async_client.imdb.get_movie("movieId")

        # verify response
        assert response.id == "id"
        assert response.title == "title"
        assert response.rating == 1.1

        # verify request was made
        assert get_movie_mock.called
        assert get_movie_mock.call_count == 1
