import datetime

from .conftest import get_client, verify_request_count

from seed import TypesNestedObjectWithRequiredField, TypesObjectWithOptionalField


def test_endpoints_object_get_and_return_with_optional_field() -> None:
    """Test getAndReturnWithOptionalField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_optional_field.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_with_optional_field()
    verify_request_count(test_id, "POST", "/object/get-and-return-with-optional-field", None, 1)


def test_endpoints_object_get_and_return_with_required_field() -> None:
    """Test getAndReturnWithRequiredField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_required_field.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_with_required_field(
        string="string",
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-required-field", None, 1)


def test_endpoints_object_get_and_return_with_map_of_map() -> None:
    """Test getAndReturnWithMapOfMap endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_map_of_map.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_with_map_of_map(
        map_={"key": {"key": "value"}},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-map-of-map", None, 1)


def test_endpoints_object_get_and_return_nested_with_optional_field() -> None:
    """Test getAndReturnNestedWithOptionalField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_nested_with_optional_field.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_nested_with_optional_field()
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-optional-field", None, 1)


def test_endpoints_object_get_and_return_nested_with_required_field() -> None:
    """Test getAndReturnNestedWithRequiredField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_nested_with_required_field.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_nested_with_required_field(
        string_="string",
        string="string",
        nested_object=TypesObjectWithOptionalField(),
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-required-field/string", None, 1)


def test_endpoints_object_get_and_return_nested_with_required_field_as_list() -> None:
    """Test getAndReturnNestedWithRequiredFieldAsList endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_nested_with_required_field_as_list.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_nested_with_required_field_as_list(
        request=[
            TypesNestedObjectWithRequiredField(
                string="string",
                nested_object=TypesObjectWithOptionalField(),
            )
        ],
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-required-field-list", None, 1)


def test_endpoints_object_get_and_return_with_unknown_field() -> None:
    """Test getAndReturnWithUnknownField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_unknown_field.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_with_unknown_field(
        unknown={"key": "value"},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-unknown-field", None, 1)


def test_endpoints_object_get_and_return_with_documented_unknown_type() -> None:
    """Test getAndReturnWithDocumentedUnknownType endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_documented_unknown_type.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_with_documented_unknown_type(
        documented_unknown_type={"key": "value"},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-documented-unknown-type", None, 1)


def test_endpoints_object_get_and_return_map_of_documented_unknown_type() -> None:
    """Test getAndReturnMapOfDocumentedUnknownType endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_map_of_documented_unknown_type.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_map_of_documented_unknown_type(
        request={},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-map-of-documented-unknown-type", None, 1)


def test_endpoints_object_get_and_return_with_datetime_like_string() -> None:
    """Test getAndReturnWithDatetimeLikeString endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_datetime_like_string.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_with_datetime_like_string(
        datetime_like_string="datetimeLikeString",
        actual_datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-datetime-like-string", None, 1)
