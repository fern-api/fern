from .conftest import get_client, verify_request_count


def test_endpoints_container_get_and_return_list_of_primitives() -> None:
    """Test getAndReturnListOfPrimitives endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_list_of_primitives.0"
    client = get_client(test_id)
    client.endpoints.container.get_and_return_list_of_primitives(request=["string", "string"])
    verify_request_count(test_id, "POST", "/container/list-of-primitives", None, 1)


def test_endpoints_container_get_and_return_list_of_objects() -> None:
    """Test getAndReturnListOfObjects endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_list_of_objects.0"
    client = get_client(test_id)
    client.endpoints.container.get_and_return_list_of_objects(request=[{"string": "string"}, {"string": "string"}])
    verify_request_count(test_id, "POST", "/container/list-of-objects", None, 1)


def test_endpoints_container_get_and_return_set_of_primitives() -> None:
    """Test getAndReturnSetOfPrimitives endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_set_of_primitives.0"
    client = get_client(test_id)
    client.endpoints.container.get_and_return_set_of_primitives(request=["string"])
    verify_request_count(test_id, "POST", "/container/set-of-primitives", None, 1)


def test_endpoints_container_get_and_return_set_of_objects() -> None:
    """Test getAndReturnSetOfObjects endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_set_of_objects.0"
    client = get_client(test_id)
    client.endpoints.container.get_and_return_set_of_objects(request=[{"string": "string"}])
    verify_request_count(test_id, "POST", "/container/set-of-objects", None, 1)


def test_endpoints_container_get_and_return_map_prim_to_prim() -> None:
    """Test getAndReturnMapPrimToPrim endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_map_prim_to_prim.0"
    client = get_client(test_id)
    client.endpoints.container.get_and_return_map_prim_to_prim(request={"string": "string"})
    verify_request_count(test_id, "POST", "/container/map-prim-to-prim", None, 1)


def test_endpoints_container_get_and_return_map_of_prim_to_object() -> None:
    """Test getAndReturnMapOfPrimToObject endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_map_of_prim_to_object.0"
    client = get_client(test_id)
    client.endpoints.container.get_and_return_map_of_prim_to_object(request={"string": {"string": "string"}})
    verify_request_count(test_id, "POST", "/container/map-prim-to-object", None, 1)


def test_endpoints_container_get_and_return_optional() -> None:
    """Test getAndReturnOptional endpoint with WireMock"""
    test_id = "endpoints.container.get_and_return_optional.0"
    client = get_client(test_id)
    client.endpoints.container.get_and_return_optional(request={"string": "string"})
    verify_request_count(test_id, "POST", "/container/opt-objects", None, 1)
