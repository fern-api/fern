import datetime

from .conftest import get_client, verify_request_count

from seed import TypesNestedObjectWithRequiredField, TypesObjectWithOptionalField


def test_endpointsObject_endpoints_object_get_and_return_with_optional_field() -> None:
    """Test endpoints_object_getAndReturnWithOptionalField endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_with_optional_field.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_with_optional_field()
    verify_request_count(test_id, "POST", "/object/get-and-return-with-optional-field", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_with_required_field() -> None:
    """Test endpoints_object_getAndReturnWithRequiredField endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_with_required_field.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_with_required_field(
        string="string",
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-required-field", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_with_map_of_map() -> None:
    """Test endpoints_object_getAndReturnWithMapOfMap endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_with_map_of_map.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_with_map_of_map(
        map_={"key": {"key": "value"}},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-map-of-map", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_nested_with_optional_field() -> None:
    """Test endpoints_object_getAndReturnNestedWithOptionalField endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_nested_with_optional_field.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_nested_with_optional_field()
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-optional-field", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_nested_with_required_field() -> None:
    """Test endpoints_object_getAndReturnNestedWithRequiredField endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_nested_with_required_field.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_nested_with_required_field(
        string_="string",
        string="string",
        nested_object=TypesObjectWithOptionalField(),
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-required-field/string", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_nested_with_required_field_as_list() -> None:
    """Test endpoints_object_getAndReturnNestedWithRequiredFieldAsList endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_nested_with_required_field_as_list.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_nested_with_required_field_as_list(
        request=[
            TypesNestedObjectWithRequiredField(
                string="string",
                nested_object=TypesObjectWithOptionalField(),
            )
        ],
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-required-field-list", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_with_unknown_field() -> None:
    """Test endpoints_object_getAndReturnWithUnknownField endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_with_unknown_field.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_with_unknown_field(
        unknown={"key": "value"},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-unknown-field", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_with_documented_unknown_type() -> None:
    """Test endpoints_object_getAndReturnWithDocumentedUnknownType endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_with_documented_unknown_type.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_with_documented_unknown_type(
        documented_unknown_type={"key": "value"},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-documented-unknown-type", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_map_of_documented_unknown_type() -> None:
    """Test endpoints_object_getAndReturnMapOfDocumentedUnknownType endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_map_of_documented_unknown_type.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_map_of_documented_unknown_type(
        request={},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-map-of-documented-unknown-type", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_with_mixed_required_and_optional_fields() -> None:
    """Test endpoints_object_getAndReturnWithMixedRequiredAndOptionalFields endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_with_mixed_required_and_optional_fields.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_with_mixed_required_and_optional_fields(
        required_string="requiredString",
        required_integer=1,
        required_long=1000000,
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-mixed-required-and-optional-fields", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_with_required_nested_object() -> None:
    """Test endpoints_object_getAndReturnWithRequiredNestedObject endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_with_required_nested_object.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_with_required_nested_object(
        required_string="requiredString",
        required_object=TypesNestedObjectWithRequiredField(
            string="string",
            nested_object=TypesObjectWithOptionalField(),
        ),
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-required-nested-object", None, 1)


def test_endpointsObject_endpoints_object_get_and_return_with_datetime_like_string() -> None:
    """Test endpoints_object_getAndReturnWithDatetimeLikeString endpoint with WireMock"""
    test_id = "endpoints_object.endpoints_object_get_and_return_with_datetime_like_string.0"
    client = get_client(test_id)
    client.endpoints_object.endpoints_object_get_and_return_with_datetime_like_string(
        datetime_like_string="datetimeLikeString",
        actual_datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-datetime-like-string", None, 1)
