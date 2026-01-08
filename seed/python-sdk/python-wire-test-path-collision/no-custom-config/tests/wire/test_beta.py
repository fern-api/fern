from .conftest import get_client, verify_request_count


def test_beta_list_services() -> None:
    """Test listServices endpoint with WireMock"""
    test_id = "beta.list_services.0"
    client = get_client(test_id)
    client.alpha.list_services()
    verify_request_count(test_id, "GET", "/v2/Services", None, 1)


def test_beta_create_service() -> None:
    """Test createService endpoint with WireMock"""
    test_id = "beta.create_service.0"
    client = get_client(test_id)
    client.alpha.create_service()
    verify_request_count(test_id, "POST", "/v2/Services", None, 1)


def test_beta_fetch_service() -> None:
    """Test fetchService endpoint with WireMock"""
    test_id = "beta.fetch_service.0"
    client = get_client(test_id)
    client.alpha.fetch_service(sid="Sid")
    verify_request_count(test_id, "GET", "/v2/Services/Sid", None, 1)
