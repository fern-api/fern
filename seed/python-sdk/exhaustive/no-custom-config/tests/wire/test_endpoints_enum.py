from seed import SeedExhaustive
from conftest import verify_request_count

import pytest



def test_endpoints_enum_get_and_return_enum() -> None:
    """Test getAndReturnEnum endpoint with WireMock"""
    test_id = "endpoints.enum.get_and_return_enum.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.enum.get_and_return_enum(request="SUNNY")
    verify_request_count(test_id, "POST", "/enum", None, 1)

