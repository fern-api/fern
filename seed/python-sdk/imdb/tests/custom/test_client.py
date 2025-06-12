"""
Tests for the IMDB SDK client.

These tests verify wire compatibility with the API specification by:
1. Setting up expectations for HTTP requests
2. Verifying the exact request format (headers, body, etc.)
3. Verifying the response handling
"""
import pytest
import httpx
from seed.imdb.client import ImdbClient
from seed.core.client_wrapper import SyncClientWrapper
from seed.imdb.types import Movie, MovieId
from seed.core.api_error import ApiError
from seed.imdb.errors import MovieDoesNotExistError
from .mock_server import MockServer, MockResponse


class TestGetMovie:
    def test_get_movie_success(self, mock_server: MockServer, base_url: str):
        """Test successful movie retrieval with wire compatibility verification."""
        movie_id = "xyz789"
        movie_data = {"id": movie_id, "title": "The Matrix", "rating": 5.0}
        
        # Set up request expectation and response
        mock_server.expect_request(
            uri=f"/imdb/movies/{movie_id}",
            method="GET",
            headers={"Authorization": "Bearer dummy-token"},
            response=MockResponse(
                status_code=200,
                body=movie_data,
                headers={"Content-Type": "application/json"}
            )
        )
        
        # Make request and verify response
        client_wrapper = SyncClientWrapper(
            base_url=base_url,
            httpx_client=httpx.Client(),
            token="dummy-token"
        )
        client = ImdbClient(client_wrapper=client_wrapper)
        movie = client.get_movie(movie_id=movie_id)
        
        # Verify response parsing
        assert movie.id == movie_id
        assert movie.title == "The Matrix"
        assert movie.rating == 5.0

    def test_get_movie_not_found(self, mock_server: MockServer, base_url: str):
        """Test 404 error handling with wire compatibility verification."""
        movie_id = "nonexistent"
        
        # Set up request expectation and response
        mock_server.expect_request(
            uri=f"/imdb/movies/{movie_id}",
            method="GET",
            headers={"Authorization": "Bearer dummy-token"},
            response=MockResponse(
                status_code=404,
                body=f'"{movie_id}"',
                headers={"Content-Type": "application/json"}
            )
        )
        
        # Make request and verify error handling
        client_wrapper = SyncClientWrapper(
            base_url=base_url,
            httpx_client=httpx.Client(),
            token="dummy-token"
        )
        client = ImdbClient(client_wrapper=client_wrapper)
        with pytest.raises(MovieDoesNotExistError) as exc_info:
            client.get_movie(movie_id=movie_id)
        assert exc_info.value.status_code == 404
        assert exc_info.value.body == movie_id

    def test_get_movie_server_error(self, mock_server: MockServer, base_url: str):
        """Test 500 error handling with wire compatibility verification."""
        movie_id = "error123"
        error_response = {"error": "Internal server error"}
        
        # Set up request expectation and response
        mock_server.expect_request(
            uri=f"/imdb/movies/{movie_id}",
            method="GET",
            headers={"Authorization": "Bearer dummy-token"},
            response=MockResponse(
                status_code=500,
                body=error_response,
                headers={"Content-Type": "application/json"}
            )
        )
        
        # Make request and verify error handling
        client_wrapper = SyncClientWrapper(
            base_url=base_url,
            httpx_client=httpx.Client(),
            token="dummy-token"
        )
        client = ImdbClient(client_wrapper=client_wrapper)
        with pytest.raises(ApiError) as exc_info:
            client.get_movie(movie_id=movie_id)
        assert exc_info.value.status_code == 500
        assert exc_info.value.body == error_response

# TODO: add TestCreateMovie tests
