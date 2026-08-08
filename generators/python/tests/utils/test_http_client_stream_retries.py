"""`stream()` must honour `retries`/`max_retries`, the way `request()` already does."""

from typing import Any, List
from unittest.mock import patch

import httpx
import pytest

from core_utilities.shared.http_client import AsyncHttpClient, HttpClient
from core_utilities.shared.request_options import RequestOptions


def _client(statuses: List[int], calls: List[Any]) -> httpx.Client:
    seq = list(statuses)

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        code = seq.pop(0) if seq else 200
        return httpx.Response(code, content=b"payload")

    return httpx.Client(transport=httpx.MockTransport(handler))


def _aclient(statuses: List[int], calls: List[Any]) -> httpx.AsyncClient:
    seq = list(statuses)

    async def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        code = seq.pop(0) if seq else 200
        return httpx.Response(code, content=b"payload")

    return httpx.AsyncClient(transport=httpx.MockTransport(handler))


@patch("core_utilities.shared.http_client.time.sleep", return_value=None)
def test_stream_retries_on_retryable_status(_sleep: Any) -> None:
    calls: List[Any] = []
    client = HttpClient(
        httpx_client=_client([503, 503, 200], calls),
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com",
        base_max_retries=2,
    )
    with client.stream(path="x", method="GET") as response:
        assert response.status_code == 200
    assert len(calls) == 3, "expected two retries before the 200"


@patch("core_utilities.shared.http_client.time.sleep", return_value=None)
def test_stream_respects_max_retries_zero(_sleep: Any) -> None:
    """Negative control: with retries disabled the caller still sees the failing response."""
    calls: List[Any] = []
    client = HttpClient(
        httpx_client=_client([503, 200], calls),
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com",
        base_max_retries=2,
    )
    opts: RequestOptions = {"max_retries": 0}  # type: ignore[typeddict-item]
    with client.stream(path="x", method="GET", request_options=opts) as response:
        assert response.status_code == 503
    assert len(calls) == 1, "max_retries=0 must not retry"


def test_stream_success_is_unchanged() -> None:
    """Negative control: the happy path must issue exactly one request and stream its body."""
    calls: List[Any] = []
    client = HttpClient(
        httpx_client=_client([200], calls),
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com",
    )
    with client.stream(path="x", method="GET") as response:
        assert response.read() == b"payload"
    assert len(calls) == 1


@patch("core_utilities.shared.http_client.time.sleep", return_value=None)
def test_stream_retries_on_connect_error(_sleep: Any) -> None:
    calls: List[Any] = []
    state = {"n": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        state["n"] += 1
        if state["n"] == 1:
            raise httpx.ConnectError("boom", request=request)
        return httpx.Response(200, content=b"payload")

    client = HttpClient(
        httpx_client=httpx.Client(transport=httpx.MockTransport(handler)),
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com",
        base_max_retries=2,
    )
    with client.stream(path="x", method="GET") as response:
        assert response.status_code == 200
    assert len(calls) == 2


@pytest.mark.asyncio
async def test_async_stream_retries_on_retryable_status() -> None:
    calls: List[Any] = []
    client = AsyncHttpClient(
        httpx_client=_aclient([503, 200], calls),
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com",
        base_max_retries=2,
    )
    with patch("core_utilities.shared.http_client.asyncio.sleep", return_value=None):
        async with client.stream(path="x", method="GET") as response:
            assert response.status_code == 200
    assert len(calls) == 2


@patch("core_utilities.shared.http_client.time.sleep", return_value=None)
def test_stream_does_not_retry_a_one_shot_body(_sleep: Any) -> None:
    """A retry re-sends the SAME object. An iterator body is consumed by the first attempt, so
    replaying it would silently send an empty body instead of failing loudly."""
    calls: List[Any] = []
    client = HttpClient(
        httpx_client=_client([503, 200], calls),
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com",
        base_max_retries=2,
    )

    def body() -> Any:
        yield b"chunk"

    with client.stream(path="x", method="POST", content=body()) as response:
        assert response.status_code == 503
    assert len(calls) == 1, "a one-shot iterator body must not be replayed"


@patch("core_utilities.shared.http_client.time.sleep", return_value=None)
def test_stream_still_retries_a_bytes_body(_sleep: Any) -> None:
    """Negative control: bytes ARE replayable, so the guard must not disable retries generally."""
    calls: List[Any] = []
    client = HttpClient(
        httpx_client=_client([503, 200], calls),
        base_timeout=lambda: None,
        base_headers=lambda: {},
        base_url=lambda: "https://example.com",
        base_max_retries=2,
    )
    with client.stream(path="x", method="POST", content=b"fixed") as response:
        assert response.status_code == 200
    assert len(calls) == 2
