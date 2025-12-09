from datetime import date, datetime
from uuid import UUID

from .conftest import get_client, verify_request_count


def test_inlinedRequests_post_with_object_bodyand_response() -> None:
    """Test postWithObjectBodyandResponse endpoint with WireMock"""
    test_id = "inlined_requests.post_with_object_bodyand_response.0"
    client = get_client(test_id)
    client.inlined_requests.post_with_object_bodyand_response(
        string="string",
        integer=1,
        nested_object={
            "string": "string",
            "integer": 1,
            "long_": 1000000,
            "double": 1.1,
            "bool_": True,
            "datetime": datetime.fromisoformat("2024-01-15T09:30:00Z"),
            "date": date.fromisoformat("2023-01-15"),
            "uuid_": UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            "base_64": "SGVsbG8gd29ybGQh",
            "list_": ["list", "list"],
            "set_": ["set"],
            "map_": {1: "map"},
            "bigint": "1000000",
        },
    )
    verify_request_count(test_id, "POST", "/req-bodies/object", None, 1)
