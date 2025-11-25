from .conftest import get_client, verify_request_count


def test_endpoints_object_get_and_return_with_optional_field() -> None:
    """Test getAndReturnWithOptionalField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_optional_field.0"
    client = get_client(test_id)
    result = client.endpoints.object.get_and_return_with_optional_field(
        string="string",
        integer=1,
        long_=1000000,
        double=1.1,
        bool_=True,
        datetime="2024-01-15T09:30:00Z",
        date="2023-01-15",
        uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        base_64="SGVsbG8gd29ybGQh",
        list_=["list", "list"],
        set_=["set"],
        map_={"1": "map"},
        bigint="1000000",
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-with-optional-field", None, 1)


def test_endpoints_object_get_and_return_with_required_field() -> None:
    """Test getAndReturnWithRequiredField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_required_field.0"
    client = get_client(test_id)
    result = client.endpoints.object.get_and_return_with_required_field(string="string")
    verify_request_count(test_id, "POST", "/object/get-and-return-with-required-field", None, 1)


def test_endpoints_object_get_and_return_with_map_of_map() -> None:
    """Test getAndReturnWithMapOfMap endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_with_map_of_map.0"
    client = get_client(test_id)
    result = client.endpoints.object.get_and_return_with_map_of_map(map_={"map": {"map": "map"}})
    verify_request_count(test_id, "POST", "/object/get-and-return-with-map-of-map", None, 1)


def test_endpoints_object_get_and_return_nested_with_optional_field() -> None:
    """Test getAndReturnNestedWithOptionalField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_nested_with_optional_field.0"
    client = get_client(test_id)
    result = client.endpoints.object.get_and_return_nested_with_optional_field(
        string="string",
        nested_object={
            "string": "string",
            "integer": 1,
            "long": 1000000,
            "double": 1.1,
            "bool": True,
            "datetime": "2024-01-15T09:30:00Z",
            "date": "2023-01-15",
            "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            "base64": "SGVsbG8gd29ybGQh",
            "list": ["list", "list"],
            "set": ["set"],
            "map": {"1": "map"},
            "bigint": "1000000",
        },
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-optional-field", None, 1)


def test_endpoints_object_get_and_return_nested_with_required_field() -> None:
    """Test getAndReturnNestedWithRequiredField endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_nested_with_required_field.0"
    client = get_client(test_id)
    result = client.endpoints.object.get_and_return_nested_with_required_field(
        "string",
        string="string",
        nested_object={
            "string": "string",
            "integer": 1,
            "long": 1000000,
            "double": 1.1,
            "bool": True,
            "datetime": "2024-01-15T09:30:00Z",
            "date": "2023-01-15",
            "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            "base64": "SGVsbG8gd29ybGQh",
            "list": ["list", "list"],
            "set": ["set"],
            "map": {"1": "map"},
            "bigint": "1000000",
        },
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-required-field/string", None, 1)


def test_endpoints_object_get_and_return_nested_with_required_field_as_list() -> None:
    """Test getAndReturnNestedWithRequiredFieldAsList endpoint with WireMock"""
    test_id = "endpoints.object.get_and_return_nested_with_required_field_as_list.0"
    client = get_client(test_id)
    result = client.endpoints.object.get_and_return_nested_with_required_field_as_list(
        request=[
            {
                "string": "string",
                "NestedObject": {
                    "string": "string",
                    "integer": 1,
                    "long": 1000000,
                    "double": 1.1,
                    "bool": True,
                    "datetime": "2024-01-15T09:30:00Z",
                    "date": "2023-01-15",
                    "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    "base64": "SGVsbG8gd29ybGQh",
                    "list": ["list", "list"],
                    "set": ["set"],
                    "map": {"1": "map"},
                    "bigint": "1000000",
                },
            },
            {
                "string": "string",
                "NestedObject": {
                    "string": "string",
                    "integer": 1,
                    "long": 1000000,
                    "double": 1.1,
                    "bool": True,
                    "datetime": "2024-01-15T09:30:00Z",
                    "date": "2023-01-15",
                    "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    "base64": "SGVsbG8gd29ybGQh",
                    "list": ["list", "list"],
                    "set": ["set"],
                    "map": {"1": "map"},
                    "bigint": "1000000",
                },
            },
        ]
    )
    verify_request_count(test_id, "POST", "/object/get-and-return-nested-with-required-field-list", None, 1)
