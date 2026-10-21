from .conftest import get_client, verify_request_count


def test_nested_api_get_something() -> None:
    """Test getSomething endpoint with WireMock"""
    test_id = "nested.api.get_something.0"
    client = get_client(test_id)
    client.nested.api.get_something()
    verify_request_count(test_id, "GET", "/nested/get-something", None, 1)
