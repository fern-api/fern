import datetime
import uuid

from .conftest import get_client, verify_request_count

from seed.types.object import NestedObjectWithRequiredField, ObjectWithOptionalField


def test_endpoints_object_get_and_return_with_optional_field() -> None:
    """Test getAndReturnWithOptionalField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_optional_field.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_with_optional_field(
        string="string",
        integer=1,
        long_=1000000,
        double=1.1,
        bool_=True,
        datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
        date=datetime.date.fromisoformat("2023-01-15"),
        uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        base_64="SGVsbG8gd29ybGQh",
        list_=["list", "list"],
        set_=["set"],
        map_={1: "map"},
        bigint="1000000",
    )
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
        map_={"map": {"map": "map"}},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-map-of-map", None, 1)


def test_endpoints_object_get_and_return_nested_with_optional_field() -> None:
    """Test getAndReturnNestedWithOptionalField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_nested_with_optional_field.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_nested_with_optional_field(
        string="string",
        nested_object=ObjectWithOptionalField(
            string="string",
            integer=1,
            long_=1000000,
            double=1.1,
            bool_=True,
            datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
            date=datetime.date.fromisoformat("2023-01-15"),
            uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base_64="SGVsbG8gd29ybGQh",
            list_=["list", "list"],
            set_=["set"],
            map_={1: "map"},
            bigint="1000000",
        ),
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-optional-field", None, 1)


def test_endpoints_object_get_and_return_nested_with_required_field() -> None:
    """Test getAndReturnNestedWithRequiredField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_nested_with_required_field.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_nested_with_required_field(
        string_="string",
        string="string",
        nested_object=ObjectWithOptionalField(
            string="string",
            integer=1,
            long_=1000000,
            double=1.1,
            bool_=True,
            datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
            date=datetime.date.fromisoformat("2023-01-15"),
            uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base_64="SGVsbG8gd29ybGQh",
            list_=["list", "list"],
            set_=["set"],
            map_={1: "map"},
            bigint="1000000",
        ),
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-required-field/string", None, 1)


def test_endpoints_object_get_and_return_nested_with_required_field_as_list() -> None:
    """Test getAndReturnNestedWithRequiredFieldAsList endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_nested_with_required_field_as_list.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_nested_with_required_field_as_list(
        request=[
            NestedObjectWithRequiredField(
                string="string",
                nested_object=ObjectWithOptionalField(
                    string="string",
                    integer=1,
                    long_=1000000,
                    double=1.1,
                    bool_=True,
                    datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
                    date=datetime.date.fromisoformat("2023-01-15"),
                    uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    base_64="SGVsbG8gd29ybGQh",
                    list_=["list", "list"],
                    set_=["set"],
                    map_={1: "map"},
                    bigint="1000000",
                ),
            ),
            NestedObjectWithRequiredField(
                string="string",
                nested_object=ObjectWithOptionalField(
                    string="string",
                    integer=1,
                    long_=1000000,
                    double=1.1,
                    bool_=True,
                    datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
                    date=datetime.date.fromisoformat("2023-01-15"),
                    uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    base_64="SGVsbG8gd29ybGQh",
                    list_=["list", "list"],
                    set_=["set"],
                    map_={1: "map"},
                    bigint="1000000",
                ),
            ),
        ],
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-required-field-list", None, 1)


def test_endpoints_object_get_and_return_with_unknown_field() -> None:
    """Test getAndReturnWithUnknownField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_unknown_field.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_with_unknown_field(
        unknown={"$ref": "https://example.com/schema"},
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
        request={"string": {"key": "value"}},
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-map-of-documented-unknown-type", None, 1)


def test_endpoints_object_get_and_return_with_datetime_like_string() -> None:
    """Test getAndReturnWithDatetimeLikeString endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_datetime_like_string.0"
    client = get_client(test_id)
    client.endpoints.object.get_and_return_with_datetime_like_string(
        datetime_like_string="2023-08-31T14:15:22Z",
        actual_datetime=datetime.datetime.fromisoformat("2023-08-31T14:15:22+00:00"),
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-datetime-like-string", None, 1)
