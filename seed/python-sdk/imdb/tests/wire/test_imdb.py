from httpx import Response

import pytest

import httpx

import respx



class TestImdbWire:
    """Wire tests for imdb endpoints using sync client"""
    @respx.mock
    def test_create_movie(self) -> None:
        """Test create_movie endpoint."""
        expected_url = "http://example.test/movies/create-movie"
        expected_response = Response(
            201,
            json="string",
            headers={"content-type": "application/json"}
        )
        create_movie_request = respx.post(expected_url)
        create_movie_mock = create_movie_request.mock(return_value=expected_response)
        from seed import SeedApi
        
        client = SeedApi(
            base_url="http://example.test/"
        )
        
        response = client.imdb.create_movie(
            title="title",
            rating=1.1
        )

        assert response == "string"
    @respx.mock
    def test_get_movie(self) -> None:
        """Test get_movie endpoint."""
        expected_url = "http://example.test/movies/movieId"
        expected_response = Response(
            200,
            json={
                "id": "id",
                "title": "title",
                "rating": 1.1,
            },
            headers={"content-type": "application/json"}
        )
        get_movie_request = respx.get(expected_url)
        get_movie_mock = get_movie_request.mock(return_value=expected_response)
        from seed import SeedApi
        
        client = SeedApi(
            base_url="http://example.test/"
        )
        
        response = client.imdb.get_movie(
            movie_id="movieId"
        )

        assert response.id == "id"
        assert response.title == "title"
        assert response.rating == 1.1

