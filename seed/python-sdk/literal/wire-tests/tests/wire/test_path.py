from .conftest import get_client, verify_request_count


def test_path_send() -> None:
    """Test send endpoint with WireMock"""
    test_id = "path.send.0"
    client = get_client(test_id)
    client.path.send()
    verify_request_count(test_id, "POST", "/path/123", None, 1)
