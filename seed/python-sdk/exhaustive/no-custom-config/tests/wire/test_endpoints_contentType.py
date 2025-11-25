from typing import Optional, Dict, Any
from seed import SeedExhaustive

import pytest

import requests



def verify_request_count(
    test_id: str,
    method: str,
    url_path: str,
    query_params: Optional[Dict[str, str]],
    expected: int,
) -> None:
    """Verifies the number of requests made to WireMock filtered by test ID for concurrency safety"""
    wiremock_admin_url = "http://localhost:8080/__admin"
    request_body: Dict[str, Any] = {
            "method": method,
            "urlPath": url_path,
            "headers": {"X-Test-Id": {"equalTo": test_id}}
        }
    if query_params:
            query_parameters = {k: {"equalTo": v} for k, v in query_params.items()}
            request_body["queryParameters"] = query_parameters
    response = requests.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"


def test_endpoints_contentType_post_json_patch_content_type() -> None:
    """Test postJsonPatchContentType endpoint with WireMock"""
    test_id = "endpoints.content_type.post_json_patch_content_type.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.content_type.post_json_patch_content_type(string="string", integer=1, long_=1000000, double=1.1, bool_=True, datetime="2024-01-15T09:30:00Z", date="2023-01-15", uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", base_64="SGVsbG8gd29ybGQh", list_=["list","list"], set_=["set"], map_={"1":"map"}, bigint="1000000")
    verify_request_count(test_id, "POST", "/foo/bar", None, 1)


def test_endpoints_contentType_post_json_patch_content_with_charset_type() -> None:
    """Test postJsonPatchContentWithCharsetType endpoint with WireMock"""
    test_id = "endpoints.content_type.post_json_patch_content_with_charset_type.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.content_type.post_json_patch_content_with_charset_type(string="string", integer=1, long_=1000000, double=1.1, bool_=True, datetime="2024-01-15T09:30:00Z", date="2023-01-15", uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", base_64="SGVsbG8gd29ybGQh", list_=["list","list"], set_=["set"], map_={"1":"map"}, bigint="1000000")
    verify_request_count(test_id, "POST", "/foo/baz", None, 1)

