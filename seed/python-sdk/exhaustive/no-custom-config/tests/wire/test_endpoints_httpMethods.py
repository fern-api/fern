from .conftest import get_client, verify_request_count


def test_endpoints_httpMethods_http_methods_test_get() -> None:
    """Test httpMethods_testGet endpoint with WireMock"""
    test_id = "endpoints.http_methods.http_methods_test_get.0"
    client = get_client(test_id)
    client.endpoints.http_methods.http_methods_test_get(
        id="id",
    )
    verify_request_count(test_id, "GET", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_http_methods_test_put() -> None:
    """Test httpMethods_testPut endpoint with WireMock"""
    test_id = "endpoints.http_methods.http_methods_test_put.0"
    client = get_client(test_id)
    client.endpoints.http_methods.http_methods_test_put(
        id="id",
        string="string",
    )
    verify_request_count(test_id, "PUT", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_http_methods_test_delete() -> None:
    """Test httpMethods_testDelete endpoint with WireMock"""
    test_id = "endpoints.http_methods.http_methods_test_delete.0"
    client = get_client(test_id)
    client.endpoints.http_methods.http_methods_test_delete(
        id="id",
    )
    verify_request_count(test_id, "DELETE", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_http_methods_test_patch() -> None:
    """Test httpMethods_testPatch endpoint with WireMock"""
    test_id = "endpoints.http_methods.http_methods_test_patch.0"
    client = get_client(test_id)
    client.endpoints.http_methods.http_methods_test_patch(
        id="id",
    )
    verify_request_count(test_id, "PATCH", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_http_methods_test_post() -> None:
    """Test httpMethods_testPost endpoint with WireMock"""
    test_id = "endpoints.http_methods.http_methods_test_post.0"
    client = get_client(test_id)
    client.endpoints.http_methods.http_methods_test_post(
        string="string",
    )
    verify_request_count(test_id, "POST", "/http-methods", None, 1)
