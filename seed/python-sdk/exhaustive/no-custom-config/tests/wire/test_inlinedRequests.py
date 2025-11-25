from seed import SeedExhaustive
from conftest import verify_request_count

import pytest



def test_inlinedRequests_post_with_object_bodyand_response() -> None:
    """Test postWithObjectBodyandResponse endpoint with WireMock"""
    test_id = "inlined_requests.post_with_object_bodyand_response.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.inlined_requests.post_with_object_bodyand_response(string="string", integer=1, nested_object={"string":"string","integer":1,"long":1000000,"double":1.1,"bool":True,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"})
    verify_request_count(test_id, "POST", "/req-bodies/object", None, 1)

