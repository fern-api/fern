from httpx import Response

import pytest

import httpx

import respx



class TestUserWire:
    """Wire tests for user endpoints using sync client"""
    @respx.mock
    def test_get_user(self) -> None:
        """Test get_user endpoint."""
        expected_url = "http://example.test/users/userId"
        expected_response = Response(
            200,
            json=None,
            headers={"content-type": "application/json"}
        )
        get_user_request = respx.get(expected_url)
        get_user_mock = get_user_request.mock(return_value=expected_response)
        from seed import SeedMultiLineDocs
        
        client = SeedMultiLineDocs(
            base_url="http://example.test/"
        )
        
        response = client.user.get_user(
            user_id="userId"
        )

        assert response is None
    @respx.mock
    def test_create_user(self) -> None:
        """Test create_user endpoint."""
        expected_url = "http://example.test/users"
        expected_response = Response(
            201,
            json={
                "id": "id",
                "name": "name",
                "age": 1,
            },
            headers={"content-type": "application/json"}
        )
        create_user_request = respx.post(expected_url)
        create_user_mock = create_user_request.mock(return_value=expected_response)
        from seed import SeedMultiLineDocs
        
        client = SeedMultiLineDocs(
            base_url="http://example.test/"
        )
        
        response = client.user.create_user(
            name="name",
            age=1
        )

        assert response.id == "id"
        assert response.name == "name"
        assert response.age == 1

