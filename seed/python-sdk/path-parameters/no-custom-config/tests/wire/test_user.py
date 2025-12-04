from .conftest import get_client, verify_request_count


def test_user_get_user() -> None:
    """Test getUser endpoint with WireMock"""
    test_id = "user.get_user.0"
    client = get_client(test_id)
    client.user.get_user(user_id="user_id")
    verify_request_count(test_id, "GET", "/{tenant_id}/user/user_id", None, 1)


def test_user_create_user() -> None:
    """Test createUser endpoint with WireMock"""
    test_id = "user.create_user.0"
    client = get_client(test_id)
    client.user.create_user(tenant_id="tenant_id", name="name", tags=["tags", "tags"])
    verify_request_count(test_id, "POST", "/{tenant_id}/user/", None, 1)


def test_user_update_user() -> None:
    """Test updateUser endpoint with WireMock"""
    test_id = "user.update_user.0"
    client = get_client(test_id)
    client.user.update_user(user_id="user_id", name="name", tags=["tags", "tags"])
    verify_request_count(test_id, "PATCH", "/{tenant_id}/user/user_id", None, 1)


def test_user_search_users() -> None:
    """Test searchUsers endpoint with WireMock"""
    test_id = "user.search_users.0"
    client = get_client(test_id)
    client.user.search_users(user_id="user_id", limit=1)
    verify_request_count(test_id, "GET", "/{tenant_id}/user/user_id/search", {"limit": "1"}, 1)


def test_user_get_user_specifics() -> None:
    """Test getUserSpecifics endpoint with WireMock"""
    test_id = "user.get_user_specifics.0"
    client = get_client(test_id)
    client.user.get_user_specifics(user_id="user_id", version=1, thought="thought")
    verify_request_count(test_id, "GET", "/{tenant_id}/user/user_id/specifics/1/thought", None, 1)


def test_user_update_user_with_conflicting_param() -> None:
    """Test updateUserWithConflictingParam endpoint with WireMock"""
    test_id = "user.update_user_with_conflicting_param.0"
    client = get_client(test_id)
    client.user.update_user_with_conflicting_param(user_id_="user_id", user_id="user_id", body="body")
    verify_request_count(test_id, "PUT", "/{tenant_id}/user/user_id", None, 1)
