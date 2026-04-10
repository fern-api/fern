from .conftest import get_client, verify_request_count


def test_endpointsParams_endpoints_params_get_with_path() -> None:
    """Test endpoints_params_getWithPath endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_get_with_path.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_get_with_path(
        param="param",
    )
    verify_request_count(test_id, "GET", "/params/path/param", None, 1)


def test_endpointsParams_endpoints_params_modify_with_path() -> None:
    """Test endpoints_params_modifyWithPath endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_modify_with_path.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_modify_with_path(
        param="param",
        request="string",
    )
    verify_request_count(test_id, "PUT", "/params/path/param", None, 1)


def test_endpointsParams_endpoints_params_get_with_inline_path() -> None:
    """Test endpoints_params_getWithInlinePath endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_get_with_inline_path.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_get_with_inline_path(
        param="param",
    )
    verify_request_count(test_id, "GET", "/params/inline-path/param", None, 1)


def test_endpointsParams_endpoints_params_modify_with_inline_path() -> None:
    """Test endpoints_params_modifyWithInlinePath endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_modify_with_inline_path.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_modify_with_inline_path(
        param="param",
        request="string",
    )
    verify_request_count(test_id, "PUT", "/params/inline-path/param", None, 1)


def test_endpointsParams_endpoints_params_get_with_query() -> None:
    """Test endpoints_params_getWithQuery endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_get_with_query.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_get_with_query(
        query="query",
        number=1,
    )
    verify_request_count(test_id, "GET", "/params", {"query": "query", "number": "1"}, 1)


def test_endpointsParams_endpoints_params_get_with_allow_multiple_query() -> None:
    """Test endpoints_params_getWithAllowMultipleQuery endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_get_with_allow_multiple_query.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_get_with_allow_multiple_query(
        query=["query"],
        number=[1],
    )
    verify_request_count(test_id, "GET", "/params/allow-multiple", {"query": "query", "number": "1"}, 1)


def test_endpointsParams_endpoints_params_get_with_path_and_query() -> None:
    """Test endpoints_params_getWithPathAndQuery endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_get_with_path_and_query.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_get_with_path_and_query(
        param="param",
        query="query",
    )
    verify_request_count(test_id, "GET", "/params/path-query/param", {"query": "query"}, 1)


def test_endpointsParams_endpoints_params_get_with_inline_path_and_query() -> None:
    """Test endpoints_params_getWithInlinePathAndQuery endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_get_with_inline_path_and_query.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_get_with_inline_path_and_query(
        param="param",
        query="query",
    )
    verify_request_count(test_id, "GET", "/params/inline-path-query/param", {"query": "query"}, 1)


def test_endpointsParams_endpoints_params_get_with_boolean_path() -> None:
    """Test endpoints_params_getWithBooleanPath endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_get_with_boolean_path.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_get_with_boolean_path(
        param=True,
    )
    verify_request_count(test_id, "GET", "/params/path-bool/true", None, 1)


def test_endpointsParams_endpoints_params_get_with_path_and_errors() -> None:
    """Test endpoints_params_getWithPathAndErrors endpoint with WireMock"""
    test_id = "endpoints_params.endpoints_params_get_with_path_and_errors.0"
    client = get_client(test_id)
    client.endpoints_params.endpoints_params_get_with_path_and_errors(
        param="param",
    )
    verify_request_count(test_id, "GET", "/params/path-with-errors/param", None, 1)
