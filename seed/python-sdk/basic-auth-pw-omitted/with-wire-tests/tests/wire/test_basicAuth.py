import pytest
from .conftest import get_client, verify_request_count

from seed.core.jsonable_encoder import jsonable_encoder
from seed.errors import BadRequest, UnauthorizedRequest


def test_basicAuth_get_with_basic_auth() -> None:
    """Test getWithBasicAuth endpoint with WireMock"""
    test_id = "basic_auth.get_with_basic_auth.0"
    client = get_client(test_id)
    client.basic_auth.get_with_basic_auth()
    verify_request_count(test_id, "GET", "/basic-auth", None, 1)


def test_basicAuth_get_with_basic_auth_throws_unauthorized_request() -> None:
    """Test getWithBasicAuth endpoint error response (UnauthorizedRequest) with WireMock"""
    test_id = "basic_auth.get_with_basic_auth.1"
    client = get_client(test_id)
    with pytest.raises(UnauthorizedRequest) as exc_info:
        client.basic_auth.get_with_basic_auth()
    assert exc_info.value.status_code == 401
    assert jsonable_encoder(exc_info.value.body) == {"message": "message"}
    verify_request_count(test_id, "GET", "/basic-auth", None, 1)


def test_basicAuth_post_with_basic_auth() -> None:
    """Test postWithBasicAuth endpoint with WireMock"""
    test_id = "basic_auth.post_with_basic_auth.0"
    client = get_client(test_id)
    client.basic_auth.post_with_basic_auth(
        request={"key": "value"},
    )
    verify_request_count(test_id, "POST", "/basic-auth", None, 1)


def test_basicAuth_post_with_basic_auth_throws_unauthorized_request() -> None:
    """Test postWithBasicAuth endpoint error response (UnauthorizedRequest) with WireMock"""
    test_id = "basic_auth.post_with_basic_auth.1"
    client = get_client(test_id)
    with pytest.raises(UnauthorizedRequest) as exc_info:
        client.basic_auth.post_with_basic_auth(
            request={"key": "value"},
        )
    assert exc_info.value.status_code == 401
    assert jsonable_encoder(exc_info.value.body) == {"message": "message"}
    verify_request_count(test_id, "POST", "/basic-auth", None, 1)


def test_basicAuth_post_with_basic_auth_throws_bad_request() -> None:
    """Test postWithBasicAuth endpoint error response (BadRequest) with WireMock"""
    test_id = "basic_auth.post_with_basic_auth.2"
    client = get_client(test_id)
    with pytest.raises(BadRequest) as exc_info:
        client.basic_auth.post_with_basic_auth(
            request={"key": "value"},
        )
    assert exc_info.value.status_code == 400
    verify_request_count(test_id, "POST", "/basic-auth", None, 1)
