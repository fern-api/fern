from .conftest import get_client, verify_request_count


def test_endpointsUrLs_endpoints_urls_with_mixed_case() -> None:
    """Test endpoints_urls_withMixedCase endpoint with WireMock"""
    test_id = "endpoints_ur_ls.endpoints_urls_with_mixed_case.0"
    client = get_client(test_id)
    client.endpoints_ur_ls.endpoints_urls_with_mixed_case()
    verify_request_count(test_id, "GET", "/urls/MixedCase", None, 1)


def test_endpointsUrLs_endpoints_urls_no_ending_slash() -> None:
    """Test endpoints_urls_noEndingSlash endpoint with WireMock"""
    test_id = "endpoints_ur_ls.endpoints_urls_no_ending_slash.0"
    client = get_client(test_id)
    client.endpoints_ur_ls.endpoints_urls_no_ending_slash()
    verify_request_count(test_id, "GET", "/urls/no-ending-slash", None, 1)


def test_endpointsUrLs_endpoints_urls_with_ending_slash() -> None:
    """Test endpoints_urls_withEndingSlash endpoint with WireMock"""
    test_id = "endpoints_ur_ls.endpoints_urls_with_ending_slash.0"
    client = get_client(test_id)
    client.endpoints_ur_ls.endpoints_urls_with_ending_slash()
    verify_request_count(test_id, "GET", "/urls/with-ending-slash/", None, 1)


def test_endpointsUrLs_endpoints_urls_with_underscores() -> None:
    """Test endpoints_urls_withUnderscores endpoint with WireMock"""
    test_id = "endpoints_ur_ls.endpoints_urls_with_underscores.0"
    client = get_client(test_id)
    client.endpoints_ur_ls.endpoints_urls_with_underscores()
    verify_request_count(test_id, "GET", "/urls/with_underscores", None, 1)
