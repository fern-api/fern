from .conftest import get_client, verify_request_count


def test_headers_send() -> None:
    """Test send endpoint with WireMock"""
    test_id = "headers.send.0"
    client = get_client(test_id)
    client.headers.send(
        query="What is the weather today",
    )
    verify_request_count(test_id, "POST", "/headers", None, 1)


def test_headers_send_literals_only() -> None:
    """Test sendLiteralsOnly endpoint with WireMock"""
    test_id = "headers.send_literals_only.0"
    client = get_client(test_id)
    client.headers.send_literals_only()
    verify_request_count(test_id, "POST", "/headers/literals-only", None, 1)
