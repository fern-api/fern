from httpx import Response

import pytest

import httpx

import respx



class TestOptionalWire:
    """Wire tests for optional endpoints using sync client"""
    @respx.mock
    def test_send_optional_body(self) -> None:
        """Test send_optional_body endpoint."""
        expected_url = "http://example.test/send-optional-body"
        expected_response = Response(
            201,
            json="string",
            headers={"content-type": "application/json"}
        )
        send_optional_body_request = respx.post(expected_url)
        send_optional_body_mock = send_optional_body_request.mock(return_value=expected_response)
        from seed import SeedObjectsWithImports
        
        client = SeedObjectsWithImports(
            base_url="http://example.test/"
        )
        
        response = client.optional.send_optional_body(
            request={
                "string": {
                    "key": "value",
                }
            }
        )

        assert response == "string"

