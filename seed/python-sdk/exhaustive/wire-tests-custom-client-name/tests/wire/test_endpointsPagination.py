from .conftest import get_client, verify_request_count


def test_endpointsPagination_endpoints_pagination_list_items() -> None:
    """Test endpoints_pagination_listItems endpoint with WireMock"""
    test_id = "endpoints_pagination.endpoints_pagination_list_items.0"
    client = get_client(test_id)
    client.endpoints_pagination.endpoints_pagination_list_items()
    verify_request_count(test_id, "GET", "/pagination", None, 1)
