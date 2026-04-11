from .conftest import get_client, verify_request_count

from seed.types.union import Animal_Dog


def test_endpoints_union_get_and_return_union() -> None:
    """Test getAndReturnUnion endpoint with WireMock"""
    test_id = "endpoints.union.get_and_return_union.0"
    client = get_client(test_id)
    client.endpoints.union.get_and_return_union(
        request=Animal_Dog(
            name="name",
            likes_to_woof=True,
        ),
    )
    verify_request_count(test_id, "POST", "/union", None, 1)
