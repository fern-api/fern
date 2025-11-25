from seed import SeedExhaustive

import pytest



def test_endpoints_httpMethods_test_get() -> None:
    """Test testGet endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_get.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.http_methods.test_get("id")
    verify_request_count(test_id, "GET", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_test_post() -> None:
    """Test testPost endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_post.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.http_methods.test_post(string="string")
    verify_request_count(test_id, "POST", "/http-methods", None, 1)


def test_endpoints_httpMethods_test_put() -> None:
    """Test testPut endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_put.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.http_methods.test_put("id", string="string")
    verify_request_count(test_id, "PUT", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_test_patch() -> None:
    """Test testPatch endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_patch.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.http_methods.test_patch("id", string="string", integer=1, long_=1000000, double=1.1, bool_=True, datetime="2024-01-15T09:30:00Z", date="2023-01-15", uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", base_64="SGVsbG8gd29ybGQh", list_=["list","list"], set_=["set"], map_={"1":"map"}, bigint="1000000")
    verify_request_count(test_id, "PATCH", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_test_delete() -> None:
    """Test testDelete endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_delete.0"
    client = SeedExhaustive(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.endpoints.http_methods.test_delete("id")
    verify_request_count(test_id, "DELETE", "/http-methods/id", None, 1)

