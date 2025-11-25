from seed import SeedExhaustive

import pytest



def test_endpoints_put_add() -> None:
    """Test add endpoint with WireMock"""
    test_id = "endpoints.put.add.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.put.add("id")
    verify_request_count(test_id, "PUT", "/id", None, 1)

