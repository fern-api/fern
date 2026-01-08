from .conftest import get_client, verify_request_count


def test_endpoints_enum_get_and_return_enum() -> None:
    """Test getAndReturnEnum endpoint with WireMock"""
    test_id = "endpoints.enum.get_and_return_enum.0"
    client = get_client(test_id)
    client.endpoints.enum.get_and_return_enum(request="SUNNY")
    verify_request_count(test_id, "POST", "/enum", None, 1)


def test_endpoints_enum_get_and_return_object_with_optional_enum() -> None:
    """Test getAndReturnObjectWithOptionalEnum endpoint with WireMock"""
    test_id = "endpoints.enum.get_and_return_object_with_optional_enum.0"
    client = get_client(test_id)
    client.endpoints.enum.get_and_return_object_with_optional_enum(string="test-string")
    verify_request_count(test_id, "POST", "/enum/object-with-optional-enum", None, 1)
