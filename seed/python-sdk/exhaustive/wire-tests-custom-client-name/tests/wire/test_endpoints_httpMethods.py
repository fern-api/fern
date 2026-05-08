from .conftest import get_client, verify_request_count


def test_endpoints_httpMethods_test_get() -> None:
    """Test testGet endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_get.0"
    client = get_client(test_id)
    client.endpoints.http_methods.test_get(
        id="id",
    )
    verify_request_count(test_id, "GET", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_test_put() -> None:
    """Test testPut endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_put.0"
    client = get_client(test_id)
    client.endpoints.http_methods.test_put(
        id="id",
        string="string",
    )
    verify_request_count(test_id, "PUT", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_test_delete() -> None:
    """Test testDelete endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_delete.0"
    client = get_client(test_id)
    client.endpoints.http_methods.test_delete(
        id="id",
    )
    verify_request_count(test_id, "DELETE", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_test_patch() -> None:
    """Test testPatch endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_patch.0"
    client = get_client(test_id)
    client.endpoints.http_methods.test_patch(
        id="id",
    )
    verify_request_count(test_id, "PATCH", "/http-methods/id", None, 1)


def test_endpoints_httpMethods_test_post() -> None:
    """Test testPost endpoint with WireMock"""
    test_id = "endpoints.http_methods.test_post.0"
    client = get_client(test_id)
    client.endpoints.http_methods.test_post(
        string="string",
    )
    verify_request_count(test_id, "POST", "/http-methods", None, 1)
