from .conftest import get_client, verify_request_count


def test_endpointsContentType_endpoints_content_type_post_json_patch_content_type() -> None:
    """Test endpoints_contentType_postJsonPatchContentType endpoint with WireMock"""
    test_id = "endpoints_content_type.endpoints_content_type_post_json_patch_content_type.0"
    client = get_client(test_id)
    client.endpoints_content_type.endpoints_content_type_post_json_patch_content_type()
    verify_request_count(test_id, "POST", "/foo/bar", None, 1)


def test_endpointsContentType_endpoints_content_type_post_json_patch_content_with_charset_type() -> None:
    """Test endpoints_contentType_postJsonPatchContentWithCharsetType endpoint with WireMock"""
    test_id = "endpoints_content_type.endpoints_content_type_post_json_patch_content_with_charset_type.0"
    client = get_client(test_id)
    client.endpoints_content_type.endpoints_content_type_post_json_patch_content_with_charset_type()
    verify_request_count(test_id, "POST", "/foo/baz", None, 1)
