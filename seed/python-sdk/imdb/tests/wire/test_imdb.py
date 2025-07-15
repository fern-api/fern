from seed import AsyncSeedApi, SeedApi

from .mock_server import MockServer


class TestImdbWire:
    """Wire tests for IMDB endpoints using sync client"""

    def test_create_movie(self, client: SeedApi, mock_server: MockServer) -> None:
        """Test create_movie endpoint with wire test"""
        
        request_body = {"title": "title", "rating": 1.1}
        response_body = "string"
        
        mock_server.mock_endpoint() \
            .post("/movies/create-movie") \
            .json_body(request_body) \
            .respond_with() \
            .status_code(200) \
            .json_body(response_body) \
            .build()
        
        response = client.imdb.create_movie(
            title="title",
            rating=1.1
        )
        
        assert response == "string"

    def test_get_movie(self, client: SeedApi, mock_server: MockServer) -> None:
        """Test get_movie endpoint with wire test"""
        
        response_body = {
            "id": "id",
            "title": "title", 
            "rating": 1.1
        }
        
        mock_server.mock_endpoint() \
            .get("/movies/movieId") \
            .respond_with() \
            .status_code(200) \
            .json_body(response_body) \
            .build()
        
        response = client.imdb.get_movie("movieId")
        
        assert response.id == "id"
        assert response.title == "title"
        assert response.rating == 1.1


class TestImdbWireAsync:
    """Wire tests for IMDB endpoints using async client"""

    async def test_create_movie_async(self, async_client: AsyncSeedApi, mock_server: MockServer) -> None:
        """Test async create_movie endpoint with wire test"""
        
        request_body = {"title": "title", "rating": 1.1}
        response_body = "string"
        
        mock_server.mock_endpoint() \
            .post("/movies/create-movie") \
            .json_body(request_body) \
            .respond_with() \
            .status_code(200) \
            .json_body(response_body) \
            .build()
        
        response = await async_client.imdb.create_movie(
            title="title",
            rating=1.1
        )
        
        assert response == "string"

    async def test_get_movie_async(self, async_client: AsyncSeedApi, mock_server: MockServer) -> None:
        """Test async get_movie endpoint with wire test"""
        
        response_body = {
            "id": "id", 
            "title": "title",
            "rating": 1.1
        }
        
        mock_server.mock_endpoint() \
            .get("/movies/movieId") \
            .respond_with() \
            .status_code(200) \
            .json_body(response_body) \
            .build()
        
        response = await async_client.imdb.get_movie("movieId")
        
        assert response.id == "id"
        assert response.title == "title" 
        assert response.rating == 1.1
