from .conftest import get_client, verify_request_count


def test_simple_get_something() -> None:
    """Test getSomething endpoint with WireMock"""
    test_id = "simple.get_something.0"
    client = get_client(test_id)
    client.simple.get_something()
    verify_request_count(test_id, "GET", "/get-something", None, 1)
