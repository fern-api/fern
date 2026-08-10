from .conftest import get_client, verify_request_count


def test_user_get() -> None:
    """Test get endpoint with WireMock"""
    test_id = "user.get.0"
    client = get_client(test_id)
    client.user.get()
    verify_request_count(test_id, "POST", "/users", None, 1)


def test_user_get_admins() -> None:
    """Test getAdmins endpoint with WireMock"""
    test_id = "user.get_admins.0"
    client = get_client(test_id)
    client.user.get_admins()
    verify_request_count(test_id, "GET", "/admins", None, 1)
