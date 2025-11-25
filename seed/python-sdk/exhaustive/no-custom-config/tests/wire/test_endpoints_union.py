from seed import SeedExhaustive
from conftest import verify_request_count

import pytest



def test_endpoints_union_get_and_return_union() -> None:
    """Test getAndReturnUnion endpoint with WireMock"""
    test_id = "endpoints.union.get_and_return_union.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.union.get_and_return_union(request={"animal":"dog","name":"name","likesToWoof":True})
    verify_request_count(test_id, "POST", "/union", None, 1)

