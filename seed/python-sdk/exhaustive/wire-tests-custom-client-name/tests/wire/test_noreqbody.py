from .conftest import get_client, verify_request_count


def test_noreqbody_getwithnorequestbody() -> None:
    """Test getwithnorequestbody endpoint with WireMock"""
    test_id = "noreqbody.getwithnorequestbody.0"
    client = get_client(test_id)
    client.noreqbody.getwithnorequestbody()
    verify_request_count(test_id, "GET", "/no-req-body", None, 1)


def test_noreqbody_postwithnorequestbody() -> None:
    """Test postwithnorequestbody endpoint with WireMock"""
    test_id = "noreqbody.postwithnorequestbody.0"
    client = get_client(test_id)
    client.noreqbody.postwithnorequestbody()
    verify_request_count(test_id, "POST", "/no-req-body", None, 1)
