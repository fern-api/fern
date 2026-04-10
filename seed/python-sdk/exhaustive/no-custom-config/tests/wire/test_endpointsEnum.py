from .conftest import get_client, verify_request_count


def test_endpointsEnum_endpoints_enum_get_and_return_enum() -> None:
    """Test endpoints_enum_getAndReturnEnum endpoint with WireMock"""
    test_id = "endpoints_enum.endpoints_enum_get_and_return_enum.0"
    client = get_client(test_id)
    client.endpoints_enum.endpoints_enum_get_and_return_enum(
        request="SUNNY",
    )
    verify_request_count(test_id, "POST", "/enum", None, 1)
