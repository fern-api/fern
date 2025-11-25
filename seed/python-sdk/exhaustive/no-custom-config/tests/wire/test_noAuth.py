from conftest import get_client, verify_request_count


def test_noAuth_post_with_no_auth() -> None:
    """Test postWithNoAuth endpoint with WireMock"""
    test_id = "no_auth.post_with_no_auth.0"
    client = get_client(test_id)
    result = client.no_auth.post_with_no_auth(request={"key": "value"})
    verify_request_count(test_id, "POST", "/no-auth", None, 1)
