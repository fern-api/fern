"""Tests to verify wire compatibility for the Unions SDK client.

We verify wire compatibility against the API specification by:
    1. Setting up expectations for HTTP requests.
    2. Validating the exact request format.
    3. Returning a mocked response and verifying the client's handling.
"""

import json
import pytest

from seed.union import Circle, Square
from seed.core.api_error import ApiError

from tests.utils.response_utils import assert_response_matches, assert_response_matches_model
from tests.utils.wire.mock_server import MockResponse
from tests.utils.wire.wire_test_base import WireTestBase, AsyncWireTestBase


class TestGetShape(WireTestBase):
    def test_get_shape_success(self):
        shape_id = "shape-123"
        shape_data = {
            "id": shape_id,
            "type": "circle",
            "radius": 1.1,
        }

        self.expect_request(
            uri=f"/{shape_id}",
            method="GET",
            headers=dict(),
            response=MockResponse(
                status_code=200,
                body=shape_data,
                headers={"Content-Type": "application/json"},
            ),
        )

        shape = self.client.union.get(id=shape_id)
        assert_response_matches_model(shape_data, shape)

    def test_get_shape_not_found(self):
        shape_id = "shape-123"
        error_response = {"error": "Shape not found"}

        self.expect_request(
            uri=f"/{shape_id}",
            method="GET",
            headers=dict(),
            response=MockResponse(
                status_code=404,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            self.client.union.get(id=shape_id)
        assert exc_info.value.status_code == 404

        assert exc_info.value.body == error_response

    def test_get_shape_server_error(self):
        shape_id = "shape-123"
        error_response = {"error": "Internal server error"}

        self.expect_request(
            uri=f"/{shape_id}",
            method="GET",
            headers=dict(),
            response=MockResponse(
                status_code=500,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            self.client.union.get(id=shape_id)
        assert exc_info.value.status_code == 500

        assert_response_matches(error_response, exc_info.value.body)


class TestUpdateShape(WireTestBase):
    def test_update_shape_success(self):
        shape = Circle(id="circle-123", radius=1.1)

        self.expect_request(
            uri="/",
            method="PATCH",
            headers=dict(),
            json_body=shape.model_dump(),
            response=MockResponse(
                status_code=200,
                body="true",
                headers={"Content-Type": "application/json"},
            ),
        )

        response = self.client.union.update(request=shape)

        assert response is True

    def test_update_shape_validation_error(self):
        shape = Square(id="square-123", length=-1.0)  # Invalid length
        error_response = {"error": "Length must be positive"}

        self.expect_request(
            uri="/",
            method="PATCH",
            headers=dict(),
            json_body=shape.model_dump(),
            response=MockResponse(
                status_code=400,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            self.client.union.update(request=shape)
        assert exc_info.value.status_code == 400

        assert_response_matches(error_response, exc_info.value.body)

    def test_update_shape_server_error(self):
        shape = Circle(id="circle-123", radius=1.1)
        error_response = {"error": "Internal server error"}

        self.expect_request(
            uri="/",
            method="PATCH",
            headers=dict(),
            json_body=shape.model_dump(),
            response=MockResponse(
                status_code=500,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            self.client.union.update(request=shape)
        assert exc_info.value.status_code == 500

        assert_response_matches(error_response, exc_info.value.body)


class TestAsyncGetShape(AsyncWireTestBase):
    @pytest.mark.asyncio
    async def test_get_shape_success(self):
        shape_id = "shape-123"
        shape_data = {
            "id": shape_id,
            "type": "circle",
            "radius": 1.1,
        }

        self.expect_request(
            uri=f"/{shape_id}",
            method="GET",
            headers=dict(),
            response=MockResponse(
                status_code=200,
                body=shape_data,
                headers={"Content-Type": "application/json"},
            ),
        )

        shape = await self.client.union.get(id=shape_id)
        assert_response_matches_model(shape_data, shape)

    @pytest.mark.asyncio
    async def test_get_shape_not_found(self):
        shape_id = "shape-123"
        error_response = {"error": "Shape not found"}

        self.expect_request(
            uri=f"/{shape_id}",
            method="GET",
            headers=dict(),
            response=MockResponse(
                status_code=404,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            await self.client.union.get(id=shape_id)
        assert exc_info.value.status_code == 404

        assert exc_info.value.body == error_response

    @pytest.mark.asyncio
    async def test_get_shape_server_error(self):
        shape_id = "shape-123"
        error_response = {"error": "Internal server error"}

        self.expect_request(
            uri=f"/{shape_id}",
            method="GET",
            headers=dict(),
            response=MockResponse(
                status_code=500,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            await self.client.union.get(id=shape_id)
        assert exc_info.value.status_code == 500

        assert_response_matches(error_response, exc_info.value.body)


class TestAsyncUpdateShape(AsyncWireTestBase):
    @pytest.mark.asyncio
    async def test_update_shape_success(self):
        shape = Circle(id="circle-123", radius=1.1)

        self.expect_request(
            uri="/",
            method="PATCH",
            headers=dict(),
            json_body=shape.model_dump(),
            response=MockResponse(
                status_code=200,
                body="true",
                headers={"Content-Type": "application/json"},
            ),
        )

        response = await self.client.union.update(request=shape)

        assert response is True

    @pytest.mark.asyncio
    async def test_update_shape_validation_error(self):
        shape = Square(id="square-123", length=-1.0)  # Invalid length
        error_response = {"error": "Length must be positive"}

        self.expect_request(
            uri="/",
            method="PATCH",
            headers=dict(),
            json_body=shape.model_dump(),
            response=MockResponse(
                status_code=400,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            await self.client.union.update(request=shape)
        assert exc_info.value.status_code == 400

        assert_response_matches(error_response, exc_info.value.body)

    @pytest.mark.asyncio
    async def test_update_shape_server_error(self):
        shape = Circle(id="circle-123", radius=1.1)
        error_response = {"error": "Internal server error"}

        self.expect_request(
            uri="/",
            method="PATCH",
            headers=dict(),
            json_body=shape.model_dump(),
            response=MockResponse(
                status_code=500,
                body=error_response,
                headers={"Content-Type": "application/json"},
            ),
        )

        with pytest.raises(ApiError) as exc_info:
            await self.client.union.update(request=shape)
        assert exc_info.value.status_code == 500

        assert_response_matches(error_response, exc_info.value.body)
