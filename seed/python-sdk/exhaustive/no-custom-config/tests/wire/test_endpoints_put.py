from .conftest import get_client, verify_request_count


def test_endpoints_put_add() -> None:
    """Test add endpoint with WireMock"""
    test_id = "endpoints.put.add.0"
    client = get_client(test_id)
    result = client.endpoints.put.add("id")
    verify_request_count(test_id, "PUT", "/id", None, 1)
