from seed import SeedExhaustive
from conftest import verify_request_count

import pytest

from datetime import datetime, date

from uuid import UUID



def test_noReqBody_get_with_no_request_body() -> None:
    """Test getWithNoRequestBody endpoint with WireMock"""
    test_id = "no_req_body.get_with_no_request_body.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.no_req_body.get_with_no_request_body()
    verify_request_count(test_id, "GET", "/no-req-body", None, 1)


def test_noReqBody_post_with_no_request_body() -> None:
    """Test postWithNoRequestBody endpoint with WireMock"""
    test_id = "no_req_body.post_with_no_request_body.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    client.no_req_body.post_with_no_request_body()
    verify_request_count(test_id, "POST", "/no-req-body", None, 1)

