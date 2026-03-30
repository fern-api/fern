from typing import AsyncGenerator, Iterator

import httpx
from ._decoders import SSEDecoder
from ._exceptions import SSEError
from ._models import ServerSentEvent


class EventSource:
    """Wraps an httpx streaming response and yields parsed SSE events."""

    def __init__(self, response: httpx.Response) -> None:
        self._response = response

    def _check_content_type(self) -> None:
        content_type = self._response.headers.get("content-type", "")
        if "text/event-stream" not in content_type:
            raise SSEError(f"Expected Content-Type 'text/event-stream', got {content_type!r}")

    @property
    def response(self) -> httpx.Response:
        return self._response

    def iter_sse(self) -> Iterator[ServerSentEvent]:
        self._check_content_type()
        decoder = SSEDecoder()
        for line in self._response.iter_lines():
            sse = decoder.decode(line)
            if sse is not None:
                yield sse

    async def aiter_sse(self) -> AsyncGenerator[ServerSentEvent, None]:
        self._check_content_type()
        decoder = SSEDecoder()
        async for line in self._response.aiter_lines():
            sse = decoder.decode(line)
            if sse is not None:
                yield sse
