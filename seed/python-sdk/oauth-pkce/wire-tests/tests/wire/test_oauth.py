from .conftest import get_client, verify_request_count


def test_oauth_authorize() -> None:
    """Test authorize endpoint with WireMock"""
    test_id = "oauth.authorize.0"
    client = get_client(test_id)
    client.oauth.authorize(
        client_id="client_abc123",
        redirect_uri="https://example.com/callback",
        code_challenge="E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
        code_challenge_method="S256",
        scope="read write",
        state="xyz",
    )
    verify_request_count(
        test_id,
        "GET",
        "/oauth/authorize",
        {
            "response_type": "code",
            "client_id": "client_abc123",
            "redirect_uri": "https://example.com/callback",
            "code_challenge": "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            "code_challenge_method": "S256",
            "scope": "read write",
            "state": "xyz",
        },
        1,
    )
