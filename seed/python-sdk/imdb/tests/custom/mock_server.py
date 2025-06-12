"""
Mock server implementation for testing the IMDB SDK.
"""
from typing import Any, Dict, Optional, Union
import json
from dataclasses import dataclass
from pytest_httpserver import HTTPServer


@dataclass
class MockResponse:
    """Represents a mock HTTP response."""
    status_code: int
    body: Union[str, Dict[str, Any]]
    headers: Optional[Dict[str, str]] = None


class MockServer:
    """A mock server for testing the IMDB SDK."""

    def __init__(self, server: HTTPServer):
        self.server = server

    def expect_request(
        self,
        uri: str,
        method: str = "GET",
        json_body: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        response: Optional[MockResponse] = None,
    ) -> None:
        """
        Set up an expectation for a request to the mock server and respond.
        Args:
            uri: The URI to expect the request on
            method: The HTTP method to expect
            json_body: The expected JSON body of the request
            headers: The expected headers of the request
            response: The response to return
        """
        matcher = self.server.expect_request(uri, method, headers=headers)
        if json_body:
            matcher.with_json(json_body)
        if response:
            if isinstance(response.body, dict):
                matcher.respond_with_json(
                    response.body, status=response.status_code, headers=response.headers
                )
            else:
                matcher.respond_with_data(
                    response.body, status=response.status_code, headers=response.headers
                ) 