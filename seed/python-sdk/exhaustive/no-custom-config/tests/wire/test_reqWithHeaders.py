from .conftest import get_client, verify_request_count


def test_reqwithheaders_getwithcustomheader() -> None:
    """Test getwithcustomheader endpoint with WireMock"""
    test_id = "reqwithheaders.getwithcustomheader.0"
    client = get_client(test_id)
    client.reqwithheaders.getwithcustomheader(
        test_endpoint_header="X-TEST-ENDPOINT-HEADER",
        request="string",
    )
    verify_request_count(test_id, "POST", "/test-headers/custom-header", None, 1)
