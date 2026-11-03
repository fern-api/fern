import pytest
from .conftest import get_client, verify_request_count

from seed.core.jsonable_encoder import jsonable_encoder
from seed.general_errors import BadRequestBody


def test_noAuth_post_with_no_auth() -> None:
    """Test postWithNoAuth endpoint with WireMock"""
    test_id = "no_auth.post_with_no_auth.0"
    client = get_client(test_id)
    client.no_auth.post_with_no_auth(
        request={"key": "value"},
    )
    verify_request_count(test_id, "POST", "/no-auth", None, 1)


def test_noAuth_post_with_no_auth_throws_bad_request_body() -> None:
    """Test postWithNoAuth endpoint error response (BadRequestBody) with WireMock"""
    test_id = "no_auth.post_with_no_auth.1"
    client = get_client(test_id)
    with pytest.raises(BadRequestBody) as exc_info:
        client.no_auth.post_with_no_auth(
            request={"key": "value"},
        )
    assert exc_info.value.status_code == 400
    assert jsonable_encoder(exc_info.value.body) == {"message": "message"}
    verify_request_count(test_id, "POST", "/no-auth", None, 1)
