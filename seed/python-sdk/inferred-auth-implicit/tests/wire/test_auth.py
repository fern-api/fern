from .conftest import get_client, verify_request_count


def test_auth_get_token_with_client_credentials() -> None:
    """Test getTokenWithClientCredentials endpoint with WireMock"""
    test_id = "auth.get_token_with_client_credentials.0"
    client = get_client(test_id)
    client.auth.get_token_with_client_credentials(
        x_api_key="X-Api-Key",
        client_id="client_id",
        client_secret="client_secret",
        scope="scope",
    )
    verify_request_count(test_id, "POST", "/token", None, 2)


def test_auth_refresh_token() -> None:
    """Test refreshToken endpoint with WireMock"""
    test_id = "auth.refresh_token.0"
    client = get_client(test_id)
    client.auth.refresh_token(
        x_api_key="X-Api-Key",
        client_id="client_id",
        client_secret="client_secret",
        refresh_token="refresh_token",
        scope="scope",
    )
    verify_request_count(test_id, "POST", "/token/refresh", None, 1)
