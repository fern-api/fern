import json
import re
import os
from contextlib import contextmanager
from typing import Any, Callable, Dict, List, Optional, Pattern, Union
from unittest.mock import patch
from urllib.parse import urljoin, urlparse

import httpx


def _find_json_mismatches(actual: Any, expected: Any) -> Dict[str, Dict[str, Any]]:
    """
    Find mismatches between actual and expected JSON objects.
    Returns a dict of path -> {actual, expected} for mismatches.
    """
    mismatches: Dict[str, Dict[str, Any]] = {}

    if type(actual) != type(expected):
        if _are_equivalent(actual, expected):
            return {}
        return {"value": {"actual": actual, "expected": expected}}

    if not isinstance(actual, (dict, list)) or actual is None or expected is None:
        if actual != expected:
            if _are_equivalent(actual, expected):
                return {}
            return {"value": {"actual": actual, "expected": expected}}
        return {}

    if isinstance(actual, list) and isinstance(expected, list):
        if len(actual) != len(expected):
            return {"length": {"actual": len(actual), "expected": len(expected)}}

        for i in range(len(actual)):
            item_mismatches = _find_json_mismatches(actual[i], expected[i])
            for mismatch_key, mismatch_value in item_mismatches.items():
                path_key = f"[{i}]" if mismatch_key == "value" else f"[{i}].{mismatch_key}"
                mismatches[path_key] = mismatch_value
        return mismatches

    if isinstance(actual, dict) and isinstance(expected, dict):
        actual_keys = set(actual.keys())
        expected_keys = set(expected.keys())
        all_keys = actual_keys | expected_keys

        for key in all_keys:
            actual_value = actual.get(key)
            expected_value = expected.get(key)

            if key not in expected_keys:
                if actual_value is not None:  # Skip None values in actual
                    mismatches[key] = {
                        "actual": actual_value, "expected": None}
            elif key not in actual_keys:
                if expected_value is not None:  # Skip None values in expected
                    mismatches[key] = {"actual": None,
                                       "expected": expected_value}
            elif isinstance(actual_value, (dict, list)) and isinstance(expected_value, (dict, list)):
                nested_mismatches = _find_json_mismatches(
                    actual_value, expected_value)
                for nested_key, nested_value in nested_mismatches.items():
                    path_key = key if nested_key == "value" else f"{key}.{nested_key}"
                    mismatches[path_key] = nested_value
            elif actual_value != expected_value:
                if not _are_equivalent(actual_value, expected_value):
                    mismatches[key] = {
                        "actual": actual_value, "expected": expected_value}

    return mismatches


def _are_equivalent(actual: Any, expected: Any) -> bool:
    """
    Check if two values are equivalent (handling special cases).
    """
    if actual == expected:
        return True
    if _is_equivalent_bigint(actual, expected):
        return True
    if _is_equivalent_datetime(actual, expected):
        return True
    return False


def _is_equivalent_bigint(actual: Any, expected: Any) -> bool:
    """Check if values are equivalent when considering BigInt conversion"""
    # Convert numbers to int for comparison
    if isinstance(actual, (int, float)) and isinstance(expected, (int, float)):
        return int(actual) == int(expected)

    # Handle string representations of numbers
    if isinstance(actual, str) and isinstance(expected, (int, float)):
        try:
            return int(actual) == int(expected)
        except ValueError:
            return False

    if isinstance(expected, str) and isinstance(actual, (int, float)):
        try:
            return int(actual) == int(expected)
        except ValueError:
            return False

    return False


def _is_equivalent_datetime(str1: Any, str2: Any) -> bool:
    """Check if two strings represent equivalent ISO datetime values"""
    if not isinstance(str1, str) or not isinstance(str2, str):
        return False

    # ISO datetime pattern
    iso_pattern = re.compile(
        r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$')

    if not iso_pattern.match(str1) or not iso_pattern.match(str2):
        return False

    try:
        from datetime import datetime
        date1 = datetime.fromisoformat(str1.replace('Z', '+00:00'))
        date2 = datetime.fromisoformat(str2.replace('Z', '+00:00'))
        return date1 == date2
    except ValueError:
        return False


def _format_http_request(request: httpx.Request, request_id: Optional[str] = None) -> str:
    """
    Format HTTP request for debug logging.
    """
    try:
        # Format headers
        headers = []
        for name, value in request.headers.items():
            headers.append(f"{name}: {value}")
        headers_str = "\n".join(headers)

        # Format body
        body = ""
        try:
            if hasattr(request, 'content') and request.content:
                content_type = request.headers.get("content-type", "")
                if "application/json" in content_type:
                    body_data = json.loads(request.content.decode('utf-8'))
                    body = json.dumps(body_data, indent=2)
                else:
                    body = request.content.decode('utf-8', errors='replace')
            else:
                body = "(no body)"
        except Exception:
            body = "(unable to parse body)"

        # Format first line
        title = f"### Request {request_id} ###\n" if request_id else ""
        first_line = f"{title}{request.method} {request.url} HTTP/1.1"

        return f"\n{first_line}\n{headers_str}\n\n{body}\n"
    except Exception as e:
        return f"Error formatting request: {e}"


def _format_http_response(response: httpx.Response, request_id: Optional[str] = None) -> str:
    """
    Format HTTP response for debug logging.
    """
    try:
        # Format headers
        headers = []
        for name, value in response.headers.items():
            headers.append(f"{name}: {value}")
        headers_str = "\n".join(headers)

        # Format body
        body = ""
        try:
            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                body_data = json.loads(response.content.decode('utf-8'))
                body = json.dumps(body_data, indent=2)
            else:
                body = response.content.decode('utf-8', errors='replace')
        except Exception:
            body = "(unable to parse body)"

        if not body:
            body = "(no body)"

        # Format first line
        title = f"### Response for {request_id} ###\n" if request_id else ""
        first_line = f"{title}HTTP/1.1 {response.status_code} {response.reason_phrase or 'OK'}"

        return f"\n{first_line}\n{headers_str}\n\n{body}\n"
    except Exception as e:
        return f"Error formatting response: {e}"


class MockResponse:
    """Represents a mock HTTP response"""

    def __init__(
        self,
        status_code: int = 200,
        headers: Optional[Dict[str, str]] = None,
        json_data: Any = None,
        text: Optional[str] = None,
        content: Optional[bytes] = None
    ):
        self.status_code = status_code
        self.headers = headers or {}
        self.json_data = json_data
        self.text = text
        self.content = content

        # Set default content-type for JSON responses
        if json_data is not None and "content-type" not in {k.lower() for k in self.headers.keys()}:
            self.headers["Content-Type"] = "application/json"

    def to_httpx_response(self, request: httpx.Request) -> httpx.Response:
        """Convert to httpx.Response object"""

        # Determine response content
        if self.json_data is not None:
            content = json.dumps(self.json_data).encode('utf-8')
        elif self.text is not None:
            content = self.text.encode('utf-8')
        elif self.content is not None:
            content = self.content
        else:
            content = b""

        # Create httpx response
        return httpx.Response(
            status_code=self.status_code,
            headers=self.headers,
            content=content,
            request=request
        )


class MockEndpoint:
    """Represents a mock endpoint with request matching"""

    def __init__(
        self,
        method: str,
        url_pattern: Union[str, Pattern],
        response: MockResponse,
        request_body: Any = None,
        request_headers: Optional[Dict[str, Union[str,
                                                  Pattern, Callable[[str], bool]]]] = None
    ):
        self.method = method.upper()
        self.url_pattern = url_pattern
        self.response = response
        self.request_body = request_body
        self.request_headers = request_headers or {}

    def _validate_headers(self, request: httpx.Request) -> Optional[Dict[str, Dict[str, Any]]]:
        """
        Validate request headers against expected patterns.
        Returns None if all headers match, or a dict of mismatches.
        """
        mismatches = {}

        for header_name, expected_value in self.request_headers.items():
            actual_value = request.headers.get(header_name)

            if actual_value is None:
                mismatches[header_name] = {
                    "actual": None,
                    "expected": self._format_expected_value(expected_value)
                }
                continue

            if callable(expected_value):
                # Function-based validation
                try:
                    if not expected_value(actual_value):
                        mismatches[header_name] = {
                            "actual": actual_value,
                            "expected": "[Function]"
                        }
                except Exception as e:
                    mismatches[header_name] = {
                        "actual": actual_value,
                        "expected": f"[Function] (error: {e})"
                    }
            elif isinstance(expected_value, Pattern):
                # RegExp pattern validation
                if not expected_value.match(actual_value):
                    mismatches[header_name] = {
                        "actual": actual_value,
                        "expected": expected_value.pattern
                    }
            elif isinstance(expected_value, str):
                # String exact match
                if expected_value != actual_value:
                    mismatches[header_name] = {
                        "actual": actual_value,
                        "expected": expected_value
                    }
            else:
                # Unsupported type
                mismatches[header_name] = {
                    "actual": actual_value,
                    "expected": f"[Unsupported type: {type(expected_value)}]"
                }

        return mismatches if mismatches else None

    def _format_expected_value(self, expected_value: Union[str, Pattern, Callable]) -> str:
        """Format expected value for error reporting"""
        if callable(expected_value):
            return "[Function]"
        elif isinstance(expected_value, Pattern):
            return expected_value.pattern
        else:
            return str(expected_value)

    def _validate_json_body(self, request: httpx.Request) -> Optional[Dict[str, Dict[str, Any]]]:
        """
        Validate request JSON body against expected object.
        Returns None if body matches, or a dict of mismatches.
        """
        if self.request_body is None:
            return None

        try:
            if hasattr(request, 'content') and request.content:
                actual_body = json.loads(request.content.decode('utf-8'))
            else:
                return {"body": {"actual": None, "expected": self.request_body}}
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            return {"body": {"actual": f"[Parse Error: {e}]", "expected": self.request_body}}

        mismatches = _find_json_mismatches(actual_body, self.request_body)
        return mismatches if mismatches else None

    def matches(self, request: httpx.Request) -> bool:
        """Check if this endpoint matches the given request"""

        # Check method
        if request.method.upper() != self.method:
            return False

        # Check URL pattern
        url_to_match = str(request.url)
        if isinstance(self.url_pattern, str):
            if not url_to_match.endswith(self.url_pattern) and url_to_match != self.url_pattern:
                # Try exact match or path matching
                parsed_request = urlparse(url_to_match)
                if not (parsed_request.path == self.url_pattern or url_to_match == self.url_pattern):
                    return False
        else:
            if not self.url_pattern.match(url_to_match):
                return False

        # Check request headers with advanced validation
        header_mismatches = self._validate_headers(request)
        if header_mismatches:
            print(
                f"Header mismatch: {json.dumps(header_mismatches, indent=2)}")
            return False

        # Check request body with deep JSON validation
        body_mismatches = self._validate_json_body(request)
        if body_mismatches:
            print(
                f"JSON body mismatch: {json.dumps(body_mismatches, indent=2)}")
            return False

        return True


class MockResponseBuilder:
    """Builder for configuring mock responses"""

    def __init__(self, endpoint_builder: "MockEndpointBuilder"):
        self._endpoint = endpoint_builder
        self._status = 200
        self._response_body = None
        self._response_headers: Dict[str, str] = {}

    def status_code(self, code: int) -> "MockResponseBuilder":
        """Set the response status code"""
        self._status = code
        return self

    def json_body(self, body: Any) -> "MockResponseBuilder":
        """Set the response JSON body"""
        self._response_body = body
        return self

    def header(self, name: str, value: str) -> "MockResponseBuilder":
        """Add a response header"""
        self._response_headers[name] = value
        return self

    def headers(self, headers: Dict[str, str]) -> "MockResponseBuilder":
        """Add multiple response headers"""
        self._response_headers.update(headers)
        return self

    def build(self) -> None:
        """Build and register the mock endpoint"""
        response = MockResponse(
            status_code=self._status,
            headers=self._response_headers,
            json_data=self._response_body
        )

        endpoint = MockEndpoint(
            method=self._endpoint._method,
            url_pattern=self._endpoint._full_url,
            response=response,
            request_body=self._endpoint._request_body,
            request_headers=self._endpoint._request_headers
        )

        self._endpoint._server._register_endpoint(endpoint)


class MockEndpointBuilder:
    """Builder for configuring mock endpoints"""

    def __init__(self, server: "MockServer"):
        self._server = server
        self._method = "GET"
        self._path = ""
        self._request_body = None
        self._request_headers: Dict[str, Union[str,
                                               Pattern, Callable[[str], bool]]] = {}

    @property
    def _full_url(self) -> str:
        """Get the full URL for this endpoint"""
        if self._path.startswith('http'):
            return self._path

        base_url = self._server.base_url.rstrip("/")
        path = self._path.lstrip("/")
        return f"{base_url}/{path}"

    def get(self, path: str) -> "MockEndpointBuilder":
        """Configure a GET endpoint"""
        self._method = "GET"
        self._path = path
        return self

    def post(self, path: str) -> "MockEndpointBuilder":
        """Configure a POST endpoint"""
        self._method = "POST"
        self._path = path
        return self

    def put(self, path: str) -> "MockEndpointBuilder":
        """Configure a PUT endpoint"""
        self._method = "PUT"
        self._path = path
        return self

    def delete(self, path: str) -> "MockEndpointBuilder":
        """Configure a DELETE endpoint"""
        self._method = "DELETE"
        self._path = path
        return self

    def patch(self, path: str) -> "MockEndpointBuilder":
        """Configure a PATCH endpoint"""
        self._method = "PATCH"
        self._path = path
        return self

    def json_body(self, body: Any) -> "MockEndpointBuilder":
        """Set expected request JSON body"""
        self._request_body = body
        return self

    def header(self, name: str, value: Union[str, Pattern, Callable[[str], bool]]) -> "MockEndpointBuilder":
        """Add expected request header with string, regex, or function validation"""
        self._request_headers[name] = value
        return self

    def header_regex(self, name: str, pattern: str) -> "MockEndpointBuilder":
        """Add expected request header with regex pattern validation"""
        self._request_headers[name] = re.compile(pattern)
        return self

    def header_function(self, name: str, validator: Callable[[str], bool]) -> "MockEndpointBuilder":
        """Add expected request header with function-based validation"""
        self._request_headers[name] = validator
        return self

    def headers(self, headers: Dict[str, Union[str, Pattern, Callable[[str], bool]]]) -> "MockEndpointBuilder":
        """Add multiple expected request headers with various validation types"""
        self._request_headers.update(headers)
        return self

    def respond_with(self) -> MockResponseBuilder:
        """Start configuring the response"""
        return MockResponseBuilder(self)


class MockServer:
    """Mock server for wire testing"""

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self._endpoints: List[MockEndpoint] = []

    def mock_endpoint(self) -> MockEndpointBuilder:
        """Create a new mock endpoint builder"""
        return MockEndpointBuilder(self)

    def _register_endpoint(self, endpoint: MockEndpoint) -> None:
        """Register a mock endpoint"""
        self._endpoints.append(endpoint)

    def find_matching_endpoint(self, request: httpx.Request) -> Optional[MockEndpoint]:
        """Find a matching endpoint for the given request"""
        for endpoint in self._endpoints:
            if endpoint.matches(request):
                return endpoint
        return None

    def reset(self) -> None:
        """Reset all mock endpoints"""
        self._endpoints.clear()


class MockServerPool:
    """Pool of mock servers for testing"""

    def __init__(self):
        self._servers: List[MockServer] = []
        self._port_counter = 8000
        self._request_counter = 0
        self._original_httpx_request = None
        self._original_async_httpx_request = None
        self._patchers: List[Any] = []
        self._is_listening = False
        self._debug_enabled = os.getenv("LOG_LEVEL") == "debug"

    def create_server(self, base_url: Optional[str] = None) -> MockServer:
        """Create a new mock server instance"""
        if base_url is None:
            # Generate a unique base URL with incrementing port
            base_url = f"http://localhost:{self._port_counter}"
            self._port_counter += 1

        server = MockServer(base_url)
        self._servers.append(server)
        return server

    def get_servers(self) -> List[MockServer]:
        """Get all created servers"""
        return list(self._servers)

    def _get_next_request_id(self) -> str:
        """Generate unique request ID for debugging"""
        self._request_counter += 1
        return f"req_{self._request_counter}"

    def _mock_httpx_request(self, httpx_client, *args, **kwargs):
        """Mock sync httpx request handler"""
        request_id = self._get_next_request_id() if self._debug_enabled else None

        request = args[0] if args else kwargs.get('method', 'GET')

        # Handle different ways httpx.request can be called
        if isinstance(request, str):
            # Called as client.request("GET", "url", ...)
            method = request
            url = args[1] if len(args) > 1 else kwargs.get('url')
            if url is None:
                # Fallback to original implementation if no URL
                if self._original_httpx_request:
                    return self._original_httpx_request(httpx_client, *args, **kwargs)
                raise ValueError("URL is required")

            # Filter kwargs to only include those accepted by httpx.Request
            request_kwargs = {
                k: v for k, v in kwargs.items()
                if k in ['params', 'headers', 'cookies', 'content', 'data', 'files', 'json', 'stream']
            }
            request_obj = httpx.Request(method, url, **request_kwargs)
        elif isinstance(request, httpx.Request):
            # Called with Request object
            request_obj = request
        else:
            # Fallback to original implementation - passthrough
            if self._original_httpx_request:
                return self._original_httpx_request(httpx_client, *args, **kwargs)
            raise ValueError("Invalid request format")

        # Debug logging - request start
        if self._debug_enabled and request_id:
            formatted_request = _format_http_request(request_obj, request_id)
            print(f"request:start{formatted_request}")

        # Look for matching mock endpoint in any server
        for server in self._servers:
            endpoint = server.find_matching_endpoint(request_obj)
            if endpoint:
                response = endpoint.response.to_httpx_response(request_obj)

                # Debug logging - response mocked
                if self._debug_enabled and request_id:
                    formatted_response = _format_http_response(
                        response, request_id)
                    print(f"response:mocked{formatted_response}")

                return response

        # Debug logging - request unhandled
        if self._debug_enabled and request_id:
            formatted_request = _format_http_request(request_obj, request_id)
            print(f"request:unhandled{formatted_request}")

        # No mock found, passthrough to original implementation
        if self._original_httpx_request:
            try:
                # Pass through the original arguments to maintain full compatibility
                return self._original_httpx_request(httpx_client, *args, **kwargs)
            except Exception as e:
                # If passthrough fails, log error but don't raise
                if self._debug_enabled:
                    print(f"Passthrough failed: {e}")
                raise
        else:
            # If no original implementation is available, this is an error
            raise RuntimeError(
                "No mock found and no original httpx implementation available for passthrough")

    async def _mock_async_httpx_request(self, httpx_client, *args, **kwargs):
        """Mock async httpx request handler"""
        request_id = self._get_next_request_id() if self._debug_enabled else None

        request = args[0] if args else kwargs.get('method', 'GET')

        # Handle different ways httpx.request can be called
        if isinstance(request, str):
            # Called as client.request("GET", "url", ...)
            method = request
            url = args[1] if len(args) > 1 else kwargs.get('url')
            if url is None:
                # Fallback to original implementation if no URL
                if self._original_async_httpx_request:
                    return await self._original_async_httpx_request(httpx_client, *args, **kwargs)
                raise ValueError("URL is required")

            # Filter kwargs to only include those accepted by httpx.Request
            request_kwargs = {
                k: v for k, v in kwargs.items()
                if k in ['params', 'headers', 'cookies', 'content', 'data', 'files', 'json', 'stream']
            }
            request_obj = httpx.Request(method, url, **request_kwargs)
        elif isinstance(request, httpx.Request):
            # Called with Request object
            request_obj = request
        else:
            # Fallback to original implementation - passthrough
            if self._original_async_httpx_request:
                return await self._original_async_httpx_request(httpx_client, *args, **kwargs)
            raise ValueError("Invalid request format")

        # Debug logging - request start
        if self._debug_enabled and request_id:
            formatted_request = _format_http_request(request_obj, request_id)
            print(f"request:start{formatted_request}")

        # Look for matching mock endpoint in any server
        for server in self._servers:
            endpoint = server.find_matching_endpoint(request_obj)
            if endpoint:
                response = endpoint.response.to_httpx_response(request_obj)

                # Debug logging - response mocked
                if self._debug_enabled and request_id:
                    formatted_response = _format_http_response(
                        response, request_id)
                    print(f"response:mocked{formatted_response}")

                return response

        # Debug logging - request unhandled
        if self._debug_enabled and request_id:
            formatted_request = _format_http_request(request_obj, request_id)
            print(f"request:unhandled{formatted_request}")

        # No mock found, passthrough to original implementation
        if self._original_async_httpx_request:
            try:
                # Pass through the original arguments to maintain full compatibility
                return await self._original_async_httpx_request(httpx_client, *args, **kwargs)
            except Exception as e:
                # If passthrough fails, log error but don't raise
                if self._debug_enabled:
                    print(f"Async passthrough failed: {e}")
                raise
        else:
            # If no original implementation is available, this is an error
            raise RuntimeError(
                "No mock found and no original async httpx implementation available for passthrough")

    def listen(self) -> None:
        """Start intercepting HTTP requests"""
        if self._is_listening:
            return

        # Store original methods
        self._original_httpx_request = httpx.Client.request
        self._original_async_httpx_request = httpx.AsyncClient.request

        # Create wrapper functions for patching
        def sync_wrapper(httpx_client, *args, **kwargs):
            return self._mock_httpx_request(httpx_client, *args, **kwargs)

        async def async_wrapper(httpx_client, *args, **kwargs):
            return await self._mock_async_httpx_request(httpx_client, *args, **kwargs)

        # Apply patches using wrapper functions
        self._patchers.append(patch.object(
            httpx.Client, 'request', sync_wrapper))
        self._patchers.append(patch.object(
            httpx.AsyncClient, 'request', async_wrapper))

        for patcher in self._patchers:
            patcher.start()

        self._is_listening = True

    def close(self) -> None:
        """Stop intercepting HTTP requests and clean up"""
        if not self._is_listening:
            return

        # Stop all patches
        for patcher in self._patchers:
            patcher.stop()

        self._patchers.clear()
        self._servers.clear()
        self._is_listening = False

    @contextmanager
    def activate(self):
        """Context manager for temporary activation"""
        self.listen()
        try:
            yield self
        finally:
            self.close()
