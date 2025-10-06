from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager, contextmanager
from typing import Any, AsyncIterator, Iterator, cast

import httpx

from ._decoders import SSEDecoder
from ._exceptions import SSEError
from ._models import ServerSentEvent


class EventSource:
    def __init__(self, response: httpx.Response) -> None:
        self._response = response

    def _check_content_type(self) -> None:
        content_type = self._response.headers.get("content-type", "").partition(";")[0]
        if "text/event-stream" not in content_type:
            raise SSEError(
                "Expected response header Content-Type to contain 'text/event-stream', "
                f"got {content_type!r}"
            )

    @property
    def response(self) -> httpx.Response:
        return self._response

    def iter_sse(self) -> Iterator[ServerSentEvent]:
        self._check_content_type()
        decoder = SSEDecoder()
        
        buffer = ""
        for chunk in self._response.iter_bytes():
            # Decode chunk and add to buffer
            text_chunk = chunk.decode('utf-8', errors='replace')
            buffer += text_chunk
            
            # Process complete lines
            while '\n' in buffer:
                line, buffer = buffer.split('\n', 1)
                line = line.rstrip('\r')
                sse = decoder.decode(line)
                # when we reach a "\n\n" => line = '' 
                # => decoder will attempt to return an SSE Event
                if sse is not None:
                    yield sse
        
        # Process any remaining data in buffer
        if buffer.strip():
            line = buffer.rstrip('\r')
            sse = decoder.decode(line)
            if sse is not None:
                yield sse

    async def aiter_sse(self) -> AsyncGenerator[ServerSentEvent, None]:
        self._check_content_type()
        decoder = SSEDecoder()
        lines = cast(AsyncGenerator[str, None], self._response.aiter_lines())
        try:
            async for line in lines:
                line = line.rstrip("\n")
                sse = decoder.decode(line)
                if sse is not None:
                    yield sse
        finally:
            await lines.aclose()


@contextmanager
def connect_sse(
    client: httpx.Client, method: str, url: str, **kwargs: Any
) -> Iterator[EventSource]:
    headers = kwargs.pop("headers", {})
    headers["Accept"] = "text/event-stream"
    headers["Cache-Control"] = "no-store"

    with client.stream(method, url, headers=headers, **kwargs) as response:
        yield EventSource(response)


@asynccontextmanager
async def aconnect_sse(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    **kwargs: Any,
) -> AsyncIterator[EventSource]:
    headers = kwargs.pop("headers", {})
    headers["Accept"] = "text/event-stream"
    headers["Cache-Control"] = "no-store"

    async with client.stream(method, url, headers=headers, **kwargs) as response:
        yield EventSource(response)
