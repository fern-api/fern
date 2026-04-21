import datetime

from .conftest import get_client, verify_request_count

from seed.bigunion import NormalSweetBigUnion


def test_bigunion_get() -> None:
    """Test get endpoint with WireMock"""
    test_id = "bigunion.get.0"
    client = get_client(test_id)
    client.bigunion.get(
        id="id",
    )
    verify_request_count(test_id, "GET", "/id", None, 1)


def test_bigunion_update() -> None:
    """Test update endpoint with WireMock"""
    test_id = "bigunion.update.0"
    client = get_client(test_id)
    client.bigunion.update(
        request=NormalSweetBigUnion(
            id="id",
            created_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
            archived_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
            value="value",
        ),
    )
    verify_request_count(test_id, "PATCH", "/", None, 1)


def test_bigunion_update_many() -> None:
    """Test update-many endpoint with WireMock"""
    test_id = "bigunion.update_many.0"
    client = get_client(test_id)
    client.bigunion.update_many(
        request=[
            NormalSweetBigUnion(
                id="id",
                created_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
                archived_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
                value="value",
            ),
            NormalSweetBigUnion(
                id="id",
                created_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
                archived_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
                value="value",
            ),
        ],
    )
    verify_request_count(test_id, "PATCH", "/many", None, 1)
