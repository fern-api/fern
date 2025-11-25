from conftest import verify_request_count

from seed import SeedExhaustive


def test_reqWithHeaders_get_with_custom_header() -> None:
    """Test getWithCustomHeader endpoint with WireMock"""
    test_id = "req_with_headers.get_with_custom_header.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.req_with_headers.get_with_custom_header(
        x_test_service_header="X-TEST-SERVICE-HEADER", x_test_endpoint_header="X-TEST-ENDPOINT-HEADER", request="string"
    )
    verify_request_count(test_id, "POST", "/test-headers/custom-header", None, 1)
