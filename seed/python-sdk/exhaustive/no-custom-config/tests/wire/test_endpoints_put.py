from .conftest import get_client, verify_request_count


def test_endpoints_put_endpoints_put_add() -> None:
    """Test endpoints_put_add endpoint with WireMock"""
    test_id = "endpoints.put.endpoints_put_add.0"
    client = get_client(test_id)
    client.endpoints.put.endpoints_put_add(
        id="id",
    )
    verify_request_count(test_id, "PUT", "/id", None, 1)
