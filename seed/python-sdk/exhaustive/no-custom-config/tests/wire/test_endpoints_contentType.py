from seed import SeedExhaustive
from conftest import verify_request_count

import pytest

from datetime import datetime, date

from uuid import UUID



def test_endpoints_contentType_post_json_patch_content_type() -> None:
    """Test postJsonPatchContentType endpoint with WireMock"""
    test_id = "endpoints.content_type.post_json_patch_content_type.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.content_type.post_json_patch_content_type(
        string="string",
        integer=1,
        long_=1000000,
        double=1.1,
        bool_=True,
        datetime=datetime.fromisoformat("2024-01-15T09:30:00Z"),
        date=date.fromisoformat("2023-01-15"),
        uuid_=UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        base_64="SGVsbG8gd29ybGQh",
        list_=[
            "list",
            "list"
        ],
        set_={
            "set"
        },
        map_={
            1: "map"
        },
        bigint="1000000"
    )
    verify_request_count(test_id, "POST", "/foo/bar", None, 1)


def test_endpoints_contentType_post_json_patch_content_with_charset_type() -> None:
    """Test postJsonPatchContentWithCharsetType endpoint with WireMock"""
    test_id = "endpoints.content_type.post_json_patch_content_with_charset_type.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.endpoints.content_type.post_json_patch_content_with_charset_type(
        string="string",
        integer=1,
        long_=1000000,
        double=1.1,
        bool_=True,
        datetime=datetime.fromisoformat("2024-01-15T09:30:00Z"),
        date=date.fromisoformat("2023-01-15"),
        uuid_=UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        base_64="SGVsbG8gd29ybGQh",
        list_=[
            "list",
            "list"
        ],
        set_={
            "set"
        },
        map_={
            1: "map"
        },
        bigint="1000000"
    )
    verify_request_count(test_id, "POST", "/foo/baz", None, 1)

