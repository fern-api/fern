from .conftest import get_client, verify_request_count


def test_basicAuth_get_with_basic_auth() -> None:
    """Test getWithBasicAuth endpoint with WireMock"""
    test_id = "basic_auth.get_with_basic_auth.0"
    client = get_client(test_id)
    client.basic_auth.get_with_basic_auth()
    verify_request_count(test_id, "GET", "/basic-auth", None, 1)


def test_basicAuth_post_with_basic_auth() -> None:
    """Test postWithBasicAuth endpoint with WireMock"""
    test_id = "basic_auth.post_with_basic_auth.0"
    client = get_client(test_id)
    client.basic_auth.post_with_basic_auth(
        request={"key": "value"},
    )
    verify_request_count(test_id, "POST", "/basic-auth", None, 1)
