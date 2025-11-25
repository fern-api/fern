from seed import SeedExhaustive
from conftest import verify_request_count

import pytest

from datetime import datetime, date

from uuid import UUID



def test_noAuth_post_with_no_auth() -> None:
    """Test postWithNoAuth endpoint with WireMock"""
    test_id = "no_auth.post_with_no_auth.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.no_auth.post_with_no_auth(
        request={
            "key": "value",
        }
    )
    verify_request_count(test_id, "POST", "/no-auth", None, 1)

