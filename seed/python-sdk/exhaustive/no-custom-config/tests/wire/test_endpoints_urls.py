from conftest import verify_request_count

from seed import SeedExhaustive


def test_endpoints_urls_with_mixed_case() -> None:
    """Test withMixedCase endpoint with WireMock"""
    test_id = "endpoints.urls.with_mixed_case.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.urls.with_mixed_case()
    verify_request_count(test_id, "GET", "/urls/MixedCase", None, 1)


def test_endpoints_urls_no_ending_slash() -> None:
    """Test noEndingSlash endpoint with WireMock"""
    test_id = "endpoints.urls.no_ending_slash.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.urls.no_ending_slash()
    verify_request_count(test_id, "GET", "/urls/no-ending-slash", None, 1)


def test_endpoints_urls_with_ending_slash() -> None:
    """Test withEndingSlash endpoint with WireMock"""
    test_id = "endpoints.urls.with_ending_slash.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.urls.with_ending_slash()
    verify_request_count(test_id, "GET", "/urls/with-ending-slash/", None, 1)


def test_endpoints_urls_with_underscores() -> None:
    """Test withUnderscores endpoint with WireMock"""
    test_id = "endpoints.urls.with_underscores.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.urls.with_underscores()
    verify_request_count(test_id, "GET", "/urls/with_underscores", None, 1)
