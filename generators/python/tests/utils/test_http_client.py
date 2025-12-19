from typing import Any, Dict

import pytest

from core_utilities.shared.http_client import (
    AsyncHttpClient,
    HttpClient,
    _build_url,
    get_request_body,
    remove_none_from_dict,
)
from core_utilities.shared.request_options import RequestOptions


# Stub clients for testing HttpClient and AsyncHttpClient
class _DummySyncClient:
    """A minimal stub for httpx.Client that records request arguments."""

    def __init__(self) -> None:
        self.last_request_kwargs: Dict[str, Any] = {}

    def request(self, **kwargs: Any) -> "_DummyResponse":
        self.last_request_kwargs = kwargs
        return _DummyResponse()


class _DummyAsyncClient:
    """A minimal stub for httpx.AsyncClient that records request arguments."""

    def __init__(self) -> None:
        self.last_request_kwargs: Dict[str, Any] = {}

    async def request(self, **kwargs: Any) -> "_DummyResponse":
        self.last_request_kwargs = kwargs
        return _DummyResponse()


class _DummyResponse:
    """A minimal stub for httpx.Response."""

    status_code = 200
    headers: Dict[str, str] = {}


def get_request_options() -> RequestOptions:
    return {"additional_body_parameters": {"see you": "later"}}


def get_request_options_with_none() -> RequestOptions:
    return {"additional_body_parameters": {"see you": "later", "optional": None}}


def test_get_json_request_body() -> None:
    json_body, data_body = get_request_body(json={"hello": "world"}, data=None, request_options=None, omit=None)
    assert json_body == {"hello": "world"}
    assert data_body is None

    json_body_extras, data_body_extras = get_request_body(
        json={"goodbye": "world"}, data=None, request_options=get_request_options(), omit=None
    )

    assert json_body_extras == {"goodbye": "world", "see you": "later"}
    assert data_body_extras is None


def test_get_files_request_body() -> None:
    json_body, data_body = get_request_body(json=None, data={"hello": "world"}, request_options=None, omit=None)
    assert data_body == {"hello": "world"}
    assert json_body is None

    json_body_extras, data_body_extras = get_request_body(
        json=None, data={"goodbye": "world"}, request_options=get_request_options(), omit=None
    )

    assert data_body_extras == {"goodbye": "world", "see you": "later"}
    assert json_body_extras is None


def test_get_none_request_body() -> None:
    json_body, data_body = get_request_body(json=None, data=None, request_options=None, omit=None)
    assert data_body is None
    assert json_body is None

    json_body_extras, data_body_extras = get_request_body(
        json=None, data=None, request_options=get_request_options(), omit=None
    )

    assert json_body_extras == {"see you": "later"}
    assert data_body_extras is None


def test_get_empty_json_request_body() -> None:
    """Test that implicit empty bodies (json=None) are collapsed to None."""
    unrelated_request_options: RequestOptions = {"max_retries": 3}
    json_body, data_body = get_request_body(json=None, data=None, request_options=unrelated_request_options, omit=None)
    assert json_body is None
    assert data_body is None


def test_explicit_empty_json_body_is_preserved() -> None:
    """Test that explicit empty bodies (json={}) are preserved and sent as {}.

    This is important for endpoints where the request body is required but all
    fields are optional. The server expects valid JSON ({}) not an empty body.
    """
    unrelated_request_options: RequestOptions = {"max_retries": 3}

    # Explicit json={} should be preserved
    json_body, data_body = get_request_body(json={}, data=None, request_options=unrelated_request_options, omit=None)
    assert json_body == {}
    assert data_body is None

    # Explicit data={} should also be preserved
    json_body2, data_body2 = get_request_body(json=None, data={}, request_options=unrelated_request_options, omit=None)
    assert json_body2 is None
    assert data_body2 == {}


def test_json_body_preserves_none_values() -> None:
    """Test that JSON bodies preserve None values (they become JSON null)."""
    json_body, data_body = get_request_body(
        json={"hello": "world", "optional": None}, data=None, request_options=None, omit=None
    )
    # JSON bodies should preserve None values
    assert json_body == {"hello": "world", "optional": None}
    assert data_body is None


def test_data_body_preserves_none_values_without_multipart() -> None:
    """Test that data bodies preserve None values when not using multipart.

    The filtering of None values happens in HttpClient.request/stream methods,
    not in get_request_body. This test verifies get_request_body doesn't filter None.
    """
    json_body, data_body = get_request_body(
        json=None, data={"hello": "world", "optional": None}, request_options=None, omit=None
    )
    # get_request_body should preserve None values in data body
    # The filtering happens later in HttpClient.request when multipart is detected
    assert data_body == {"hello": "world", "optional": None}
    assert json_body is None


def test_remove_none_from_dict_filters_none_values() -> None:
    """Test that remove_none_from_dict correctly filters out None values."""
    original = {"hello": "world", "optional": None, "another": "value", "also_none": None}
    filtered = remove_none_from_dict(original)
    assert filtered == {"hello": "world", "another": "value"}
    # Original should not be modified
    assert original == {"hello": "world", "optional": None, "another": "value", "also_none": None}


def test_remove_none_from_dict_empty_dict() -> None:
    """Test that remove_none_from_dict handles empty dict."""
    assert remove_none_from_dict({}) == {}


def test_remove_none_from_dict_all_none() -> None:
    """Test that remove_none_from_dict handles dict with all None values."""
    assert remove_none_from_dict({"a": None, "b": None}) == {}


def test_http_client_does_not_pass_empty_params_list() -> None:
    """Test that HttpClient passes params=None when params are empty.

    This prevents httpx from stripping existing query parameters from the URL,
    which happens when params=[] or params={} is passed.
    """
    dummy_client = _DummySyncClient()
    http_client = HttpClient(
        httpx_client=dummy_client,  # type: ignore[arg-type]
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com",
    )

    # Use a path with query params (e.g., pagination cursor URL)
    http_client.request(
        path="resource?after=123",
        method="GET",
        params=None,
        request_options=None,
    )

    # We care that httpx receives params=None, not [] or {}
    assert "params" in dummy_client.last_request_kwargs
    assert dummy_client.last_request_kwargs["params"] is None

    # Verify the query string in the URL is preserved
    url = str(dummy_client.last_request_kwargs["url"])
    assert "after=123" in url, f"Expected query param 'after=123' in URL, got: {url}"


def test_http_client_passes_encoded_params_when_present() -> None:
    """Test that HttpClient passes encoded params when params are provided."""
    dummy_client = _DummySyncClient()
    http_client = HttpClient(
        httpx_client=dummy_client,  # type: ignore[arg-type]
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com/resource",
    )

    http_client.request(
        path="",
        method="GET",
        params={"after": "456"},
        request_options=None,
    )

    params = dummy_client.last_request_kwargs["params"]
    # For a simple dict, encode_query should give a single (key, value) tuple
    assert params == [("after", "456")]


@pytest.mark.asyncio
async def test_async_http_client_does_not_pass_empty_params_list() -> None:
    """Test that AsyncHttpClient passes params=None when params are empty.

    This prevents httpx from stripping existing query parameters from the URL,
    which happens when params=[] or params={} is passed.
    """
    dummy_client = _DummyAsyncClient()
    http_client = AsyncHttpClient(
        httpx_client=dummy_client,  # type: ignore[arg-type]
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com",
        async_base_headers=None,
    )

    # Use a path with query params (e.g., pagination cursor URL)
    await http_client.request(
        path="resource?after=123",
        method="GET",
        params=None,
        request_options=None,
    )

    # We care that httpx receives params=None, not [] or {}
    assert "params" in dummy_client.last_request_kwargs
    assert dummy_client.last_request_kwargs["params"] is None

    # Verify the query string in the URL is preserved
    url = str(dummy_client.last_request_kwargs["url"])
    assert "after=123" in url, f"Expected query param 'after=123' in URL, got: {url}"


@pytest.mark.asyncio
async def test_async_http_client_passes_encoded_params_when_present() -> None:
    """Test that AsyncHttpClient passes encoded params when params are provided."""
    dummy_client = _DummyAsyncClient()
    http_client = AsyncHttpClient(
        httpx_client=dummy_client,  # type: ignore[arg-type]
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com/resource",
        async_base_headers=None,
    )

    await http_client.request(
        path="",
        method="GET",
        params={"after": "456"},
        request_options=None,
    )

    params = dummy_client.last_request_kwargs["params"]
    # For a simple dict, encode_query should give a single (key, value) tuple
    assert params == [("after", "456")]


def test_basic_url_joining() -> None:
    """Test basic URL joining with a simple base URL and path."""
    result = _build_url("https://api.example.com", "/users")
    assert result == "https://api.example.com/users"


def test_basic_url_joining_trailing_slash() -> None:
    """Test basic URL joining with a simple base URL and path."""
    result = _build_url("https://api.example.com/", "/users")
    assert result == "https://api.example.com/users"


def test_preserves_base_url_path_prefix() -> None:
    """Test that path prefixes in base URL are preserved.

    This is the critical bug fix - urllib.parse.urljoin() would strip
    the path prefix when the path starts with '/'.
    """
    result = _build_url("https://cloud.example.com/org/tenant/api", "/users")
    assert result == "https://cloud.example.com/org/tenant/api/users"


def test_preserves_base_url_path_prefix_trailing_slash() -> None:
    """Test that path prefixes in base URL are preserved."""
    result = _build_url("https://cloud.example.com/org/tenant/api/", "/users")
    assert result == "https://cloud.example.com/org/tenant/api/users"
