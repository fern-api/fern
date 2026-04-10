from .conftest import get_client, verify_request_count


def test_noauth_postwithnoauth() -> None:
    """Test postwithnoauth endpoint with WireMock"""
    test_id = "noauth.postwithnoauth.0"
    client = get_client(test_id)
    client.noauth.postwithnoauth(
        request={"key": "value"},
    )
    verify_request_count(test_id, "POST", "/no-auth", None, 1)
