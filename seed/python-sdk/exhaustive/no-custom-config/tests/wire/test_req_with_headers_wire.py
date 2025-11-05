from typing import Any
from .utils import client, wiremock_base_url, reset_wiremock_requests, verify_request_count

class TestReqWithHeaders:
    """Wire tests for req_with_headers service"""
    def test_get_with_custom_header(self: Any, client: Any):
        # Reset WireMock requests
        reset_wiremock_requests()
        
        # TODO: Parse and generate client call from dynamic snippet
        # This would be populated with actual client method calls
        
        # TODO: Generate actual client method invocation here
        # Example: response = client.req_with_headers.getWithCustomHeader(request)
        
        # Verify request was made to correct endpoint
        verify_request_count(
            method="POST",
            url_path="/test-headers/custom-header",
            expected=1
        )

