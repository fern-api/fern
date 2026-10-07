import asyncio
import socket
import threading
import typing
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch

import httpx
import pytest

from core_utilities.shared.http_client import AsyncHttpClient, HttpClient
from core_utilities.shared.request_options import RequestOptions


@contextmanager
def disconnect_server(mode: str) -> typing.Iterator[typing.Tuple[str, typing.List[str]]]:
    requests: typing.List[str] = []

    class Handler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, format: str, *args: typing.Any) -> None:
            pass

        def handle_request(self) -> None:
            self.rfile.read(int(self.headers.get("Content-Length", 0)))
            requests.append(self.command)
            if mode == "no_response":
                self.connection.shutdown(socket.SHUT_RDWR)
                self.close_connection = True
                return
            body = b'{"ok": true}'
            status = int(mode) if mode in ("429", "503") and len(requests) == 1 else 200
            self.send_response(status)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if mode == "partial_200" and len(requests) == 1:
                self.wfile.write(body[:3])
                self.wfile.flush()
                self.connection.shutdown(socket.SHUT_RDWR)
                self.close_connection = True
                return
            self.wfile.write(body)
            self.wfile.flush()
            if mode == "idle_close":
                self.connection.shutdown(socket.SHUT_RDWR)
                self.close_connection = True

        do_POST = handle_request
        do_PATCH = handle_request
        do_GET = handle_request

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}", requests
    finally:
        server.shutdown()
        server.server_close()
        worker.join()


async def call(
    client: typing.Union[HttpClient, AsyncHttpClient], method: str, options: typing.Optional[RequestOptions] = None
) -> httpx.Response:
    if isinstance(client, AsyncHttpClient):
        return await client.request(method=method, json={"value": 1}, request_options=options)
    return client.request(method=method, json={"value": 1}, request_options=options)


@pytest.mark.asyncio
@pytest.mark.parametrize("asynchronous", [False, True])
@pytest.mark.parametrize("method", ["POST", "PATCH", "GET"])
@pytest.mark.parametrize("mode", ["partial_200", "no_response"])
async def test_disconnect_is_not_replayed(asynchronous: bool, method: str, mode: str) -> None:
    with disconnect_server(mode) as (url, requests):
        async with httpx.AsyncClient() as async_transport:
            with httpx.Client() as sync_transport:
                client = make_client(url, asynchronous, sync_transport, async_transport)
                with pytest.raises(httpx.RemoteProtocolError):
                    await call(client, method)
                assert requests == [method]


def make_client(
    url: str, asynchronous: bool, sync_transport: httpx.Client, async_transport: httpx.AsyncClient
) -> typing.Union[HttpClient, AsyncHttpClient]:
    if asynchronous:
        return AsyncHttpClient(
            httpx_client=async_transport, base_timeout=lambda: 2, base_headers=lambda: {}, base_url=lambda: url
        )
    return HttpClient(
        httpx_client=sync_transport, base_timeout=lambda: 2, base_headers=lambda: {}, base_url=lambda: url
    )


@pytest.mark.asyncio
@pytest.mark.parametrize("asynchronous", [False, True])
@pytest.mark.parametrize("mode", ["idle_close", "429", "503", "partial_200"])
async def test_safe_retries_and_explicit_replay(asynchronous: bool, mode: str) -> None:
    with disconnect_server(mode) as (url, requests):
        async with httpx.AsyncClient() as async_transport:
            with httpx.Client() as sync_transport:
                client = make_client(url, asynchronous, sync_transport, async_transport)
                options: RequestOptions = {"retry_remote_protocol_errors": mode == "partial_200"}
                with patch("core_utilities.shared.http_client._retry_timeout", return_value=0), patch(
                    "core_utilities.shared.http_client._retry_timeout_from_retries", return_value=0
                ):
                    response = await call(client, "POST", options)
                assert response.json() == {"ok": True}
                if mode == "idle_close":
                    await asyncio.sleep(0.05)
                    response = await call(client, "POST", {"max_retries": 0})
                    assert response.json() == {"ok": True}
                assert requests == ["POST", "POST"]


@pytest.mark.asyncio
@pytest.mark.parametrize("asynchronous", [False, True])
@pytest.mark.parametrize(
    "options, attempts",
    [
        ({"max_retries": 2}, 1),
        ({"retry_remote_protocol_errors": True, "max_retries": 0}, 1),
        ({"retry_remote_protocol_errors": True, "max_retries": 2}, 3),
    ],
)
async def test_explicit_replay_obeys_retry_limit(asynchronous: bool, options: RequestOptions, attempts: int) -> None:
    with disconnect_server("no_response") as (url, requests):
        async with httpx.AsyncClient() as async_transport:
            with httpx.Client() as sync_transport:
                client = make_client(url, asynchronous, sync_transport, async_transport)
                with patch(
                    "core_utilities.shared.http_client._retry_timeout_from_retries", return_value=0
                ), pytest.raises(httpx.RemoteProtocolError):
                    await call(client, "POST", options)
                assert requests == ["POST"] * attempts


@pytest.mark.asyncio
@pytest.mark.parametrize("asynchronous", [False, True])
async def test_refused_post_connection_is_retried(asynchronous: bool) -> None:
    with socket.socket() as bound_socket:
        bound_socket.bind(("127.0.0.1", 0))
        url = f"http://127.0.0.1:{bound_socket.getsockname()[1]}"
        async with httpx.AsyncClient() as async_transport:
            with httpx.Client() as sync_transport:
                client = make_client(url, asynchronous, sync_transport, async_transport)
                with patch("core_utilities.shared.http_client._retry_timeout_from_retries", return_value=0) as delay:
                    with pytest.raises(httpx.ConnectError):
                        await call(client, "POST")
                    assert delay.call_count == 2
