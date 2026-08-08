from .conftest import get_client, verify_request_count


def test_auth_get_token() -> None:
    """Test getToken endpoint with WireMock"""
    test_id = "auth.get_token.0"
    client = get_client(test_id)
    client.auth.get_token(
        client_id="client_id",
        client_secret="client_secret",
    )
    verify_request_count(test_id, "POST", "/token", None, 2)
