from .conftest import get_client, verify_request_count


def test_auth_refresh_token() -> None:
    """Test refreshToken endpoint with WireMock"""
    test_id = "auth.refresh_token.0"
    client = get_client(test_id)
    client.auth.refresh_token(
        refresh_token="refresh_token",
    )
    verify_request_count(test_id, "POST", "/token", None, 2)
