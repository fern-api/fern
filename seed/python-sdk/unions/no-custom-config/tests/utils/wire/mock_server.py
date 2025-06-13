from typing import Any, Dict, Optional
from dataclasses import dataclass
from pytest_httpserver import HTTPServer


@dataclass
class MockResponse:
    status_code: int
    body: Any
    headers: Dict[str, str]


class MockServer:

    def __init__(self, server: HTTPServer):
        self.server = server

    def expect_request(
        self,
        uri: str,
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        json_body: Optional[Dict[str, Any]] = None,
        response: Optional[MockResponse] = None,
    ) -> None:
        """Set up an expectation for a request and configure a mock response.

        Args:
            uri: The URI to expect
            method: The HTTP method to expect
            headers: The headers to expect
            json_body: The JSON body to expect
            response: The response to return
        """
        if json_body:
            matcher = self.server.expect_request(
                uri, method, headers=headers, json=json_body
            )
        else:
            matcher = self.server.expect_request(uri, method, headers=headers)

        if response:
            if isinstance(response.body, dict):
                matcher.respond_with_json(
                    response.body, status=response.status_code, headers=response.headers
                )
            else:
                matcher.respond_with_data(
                    response.body, status=response.status_code, headers=response.headers
                )
        else:
            response = MockResponse(
                status_code=200,
                body={},
                headers={"Content-Type": "application/json"},
            )
