from .conftest import get_client, verify_request_count

from seed.union import CircleShape


def test_union_get() -> None:
    """Test get endpoint with WireMock"""
    test_id = "union.get.0"
    client = get_client(test_id)
    client.union.get(
        id="id",
    )
    verify_request_count(test_id, "GET", "/id", None, 1)


def test_union_update() -> None:
    """Test update endpoint with WireMock"""
    test_id = "union.update.0"
    client = get_client(test_id)
    client.union.update(
        request=CircleShape(
            id="id",
            radius=1.1,
        ),
    )
    verify_request_count(test_id, "PATCH", "/", None, 1)
