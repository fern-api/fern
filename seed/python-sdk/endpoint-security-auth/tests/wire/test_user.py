from .conftest import get_client, verify_auth_headers, verify_request_count


def test_user_get_with_bearer() -> None:
    """Test getWithBearer endpoint with WireMock"""
    test_id = "user.get_with_bearer.0"
    client = get_client(test_id)
    client.user.get_with_bearer()
    verify_request_count(test_id, "GET", "/users", None, 1)
    verify_auth_headers(test_id, "GET", "/users", {"Authorization": r"Bearer .+"}, ["X-API-Key"])


def test_user_get_with_api_key() -> None:
    """Test getWithApiKey endpoint with WireMock"""
    test_id = "user.get_with_api_key.0"
    client = get_client(test_id)
    client.user.get_with_api_key()
    verify_request_count(test_id, "GET", "/users", None, 1)
    verify_auth_headers(test_id, "GET", "/users", {"X-API-Key": r".+"}, ["Authorization"])


def test_user_get_with_o_auth() -> None:
    """Test getWithOAuth endpoint with WireMock"""
    test_id = "user.get_with_o_auth.0"
    client = get_client(test_id)
    client.user.get_with_o_auth()
    verify_request_count(test_id, "GET", "/users", None, 1)
    verify_auth_headers(test_id, "GET", "/users", {"Authorization": r"Bearer .+"}, ["X-API-Key"])


def test_user_get_with_basic() -> None:
    """Test getWithBasic endpoint with WireMock"""
    test_id = "user.get_with_basic.0"
    client = get_client(test_id)
    client.user.get_with_basic()
    verify_request_count(test_id, "GET", "/users", None, 1)
    verify_auth_headers(test_id, "GET", "/users", {"Authorization": r"Basic .+"}, ["X-API-Key"])


def test_user_get_with_inferred_auth() -> None:
    """Test getWithInferredAuth endpoint with WireMock"""
    test_id = "user.get_with_inferred_auth.0"
    client = get_client(test_id)
    client.user.get_with_inferred_auth()
    verify_request_count(test_id, "GET", "/users", None, 1)
    verify_auth_headers(test_id, "GET", "/users", {"Authorization": r"Bearer .+"}, ["X-API-Key"])


def test_user_get_with_any_auth() -> None:
    """Test getWithAnyAuth endpoint with WireMock"""
    test_id = "user.get_with_any_auth.0"
    client = get_client(test_id)
    client.user.get_with_any_auth()
    verify_request_count(test_id, "GET", "/users", None, 1)
    verify_auth_headers(test_id, "GET", "/users", {"Authorization": r"Bearer .+"}, ["X-API-Key"])


def test_user_get_with_all_auth() -> None:
    """Test getWithAllAuth endpoint with WireMock"""
    test_id = "user.get_with_all_auth.0"
    client = get_client(test_id)
    client.user.get_with_all_auth()
    verify_request_count(test_id, "GET", "/users", None, 1)
    verify_auth_headers(test_id, "GET", "/users", {"Authorization": r".+", "X-API-Key": r".+"}, [])
