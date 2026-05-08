from .conftest import get_client, verify_request_count


def test_endpoints_contentType_post_json_patch_content_type() -> None:
    """Test postJsonPatchContentType endpoint with WireMock"""
    test_id = "endpoints.content_type.post_json_patch_content_type.0"
    client = get_client(test_id)
    client.endpoints.content_type.post_json_patch_content_type()
    verify_request_count(test_id, "POST", "/foo/bar", None, 1)


def test_endpoints_contentType_post_json_patch_content_with_charset_type() -> None:
    """Test postJsonPatchContentWithCharsetType endpoint with WireMock"""
    test_id = "endpoints.content_type.post_json_patch_content_with_charset_type.0"
    client = get_client(test_id)
    client.endpoints.content_type.post_json_patch_content_with_charset_type()
    verify_request_count(test_id, "POST", "/foo/baz", None, 1)
