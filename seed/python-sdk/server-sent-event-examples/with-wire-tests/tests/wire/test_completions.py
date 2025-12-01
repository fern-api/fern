from conftest import verify_request_count

from seed import SeedServerSentEvents


def test_completions_stream() -> None:
    """Test stream endpoint with WireMock"""
    test_id = "completions.stream.0"
    client = SeedServerSentEvents(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})
    result = client.completions.stream(query="foo")
    verify_request_count(test_id, "POST", "/stream", None, 1)
