from .conftest import get_client, verify_request_count


def test_endpoints_params_get_with_path() -> None:
    """Test getWithPath endpoint with WireMock"""
    test_id = "endpoints.params.get_with_path.0"
    client = get_client(test_id)
    result = client.endpoints.params.get_with_path("param")
    verify_request_count(test_id, "GET", "/params/path/param", None, 1)


def test_endpoints_params_get_with_inline_path() -> None:
    """Test getWithInlinePath endpoint with WireMock"""
    test_id = "endpoints.params.get_with_inline_path.0"
    client = get_client(test_id)
    result = client.endpoints.params.get_with_inline_path("param")
    verify_request_count(test_id, "GET", "/params/path/param", None, 1)


def test_endpoints_params_get_with_query() -> None:
    """Test getWithQuery endpoint with WireMock"""
    test_id = "endpoints.params.get_with_query.0"
    client = get_client(test_id)
    result = client.endpoints.params.get_with_query(query="query", number=1)
    verify_request_count(test_id, "GET", "/params", {"query": "query", "number": "1"}, 1)


def test_endpoints_params_get_with_allow_multiple_query() -> None:
    """Test getWithAllowMultipleQuery endpoint with WireMock"""
    test_id = "endpoints.params.get_with_allow_multiple_query.0"
    client = get_client(test_id)
    result = client.endpoints.params.get_with_allow_multiple_query(query="query", number=1)
    verify_request_count(test_id, "GET", "/params", {"query": "query", "number": "1"}, 1)


def test_endpoints_params_get_with_path_and_query() -> None:
    """Test getWithPathAndQuery endpoint with WireMock"""
    test_id = "endpoints.params.get_with_path_and_query.0"
    client = get_client(test_id)
    result = client.endpoints.params.get_with_path_and_query("param", query="query")
    verify_request_count(test_id, "GET", "/params/path-query/param", {"query": "query"}, 1)


def test_endpoints_params_get_with_inline_path_and_query() -> None:
    """Test getWithInlinePathAndQuery endpoint with WireMock"""
    test_id = "endpoints.params.get_with_inline_path_and_query.0"
    client = get_client(test_id)
    result = client.endpoints.params.get_with_inline_path_and_query("param", query="query")
    verify_request_count(test_id, "GET", "/params/path-query/param", {"query": "query"}, 1)


def test_endpoints_params_modify_with_path() -> None:
    """Test modifyWithPath endpoint with WireMock"""
    test_id = "endpoints.params.modify_with_path.0"
    client = get_client(test_id)
    result = client.endpoints.params.modify_with_path("param", request="string")
    verify_request_count(test_id, "PUT", "/params/path/param", None, 1)


def test_endpoints_params_modify_with_inline_path() -> None:
    """Test modifyWithInlinePath endpoint with WireMock"""
    test_id = "endpoints.params.modify_with_inline_path.0"
    client = get_client(test_id)
    result = client.endpoints.params.modify_with_inline_path("param", request="string")
    verify_request_count(test_id, "PUT", "/params/path/param", None, 1)
