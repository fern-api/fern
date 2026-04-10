from .conftest import get_client, verify_request_count

from seed import TypesAnimalZero


def test_endpointsUnion_endpoints_union_get_and_return_union() -> None:
    """Test endpoints_union_getAndReturnUnion endpoint with WireMock"""
    test_id = "endpoints_union.endpoints_union_get_and_return_union.0"
    client = get_client(test_id)
    client.endpoints_union.endpoints_union_get_and_return_union(
        request=TypesAnimalZero(
            name="name",
            likes_to_woof=True,
            animal="dog",
        ),
    )
    verify_request_count(test_id, "POST", "/union", None, 1)
