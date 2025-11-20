@pytest.fixture(autouse=True)
def setup_client() -> None:
    """Reset WireMock before each test"""
    reset_wiremock_requests()


def reset_wiremock_requests() -> None:
    """Resets all WireMock request journal"""
    wiremock_admin_url = "http://localhost:8080/__admin"
    response = requests.delete(f"{wiremock_admin_url}/requests")
    assert response.status_code == 200, "Failed to reset WireMock requests"


def verify_request_count(
    method: str,
    url_path: str,
    query_params: Optional[Dict[str, str]],
    expected: int,
) -> None:
    """Verifies the number of requests made to WireMock"""
    wiremock_admin_url = "http://localhost:8080/__admin"
    request_body = {"method": method, "urlPath": url_path}
    if query_params:
            query_parameters = {k: {"equalTo": v} for k, v in query_params.items()}
            request_body["queryParameters"] = query_parameters
    response = requests.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"


@pytest.mark.asyncio
def test_endpoints_contentType_post_json_patch_content_type() -> None:
    """Test postJsonPatchContentType endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.post_json_patch_content_type(request={"string":"string","integer":1,"long":1000000,"double":1.1,"bool":true,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"})
    verify_request_count("POST", "/foo/bar", None, 1)


@pytest.mark.asyncio
def test_endpoints_contentType_post_json_patch_content_with_charset_type() -> None:
    """Test postJsonPatchContentWithCharsetType endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.post_json_patch_content_with_charset_type(request={"string":"string","integer":1,"long":1000000,"double":1.1,"bool":true,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"})
    verify_request_count("POST", "/foo/baz", None, 1)

