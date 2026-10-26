from .conftest import get_client, verify_request_count


def test_nestedNoAuth_api_get_something() -> None:
    """Test getSomething endpoint with WireMock"""
    test_id = "nested_no_auth.api.get_something.0"
    client = get_client(test_id)
    client.nested_no_auth.api.get_something()
    verify_request_count(test_id, "GET", "/nested-no-auth/get-something", None, 1)
