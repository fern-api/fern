import codecs
import re
from contextlib import asynccontextmanager, contextmanager
from typing import Any, AsyncGenerator, AsyncIterator, Iterator

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
                f"Expected response header Content-Type to contain 'text/event-stream', got {content_type!r}"
            )

    def _get_charset(self) -> str:
        """Extract charset from Content-Type header, fallback to UTF-8."""
        content_type = self._response.headers.get("content-type", "")

        # Parse charset parameter using regex
        charset_match = re.search(r"charset=([^;\s]+)", content_type, re.IGNORECASE)
        if charset_match:
            charset = charset_match.group(1).strip("\"'")
            # Validate that it's a known encoding
            try:
                # Test if the charset is valid by trying to encode/decode
                "test".encode(charset).decode(charset)
                return charset
            except (LookupError, UnicodeError):
                # If charset is invalid, fall back to UTF-8
                pass

        # Default to UTF-8 if no charset specified or invalid charset
        return "utf-8"

    @property
    def response(self) -> httpx.Response:
        return self._response

    def iter_sse(self) -> Iterator[ServerSentEvent]:
        self._check_content_type()
        decoder = SSEDecoder()
        charset = self._get_charset()
        text_decoder = codecs.getincrementaldecoder(charset)(errors="replace")

        buf = ""
        for chunk in self._response.iter_bytes():
            buf += text_decoder.decode(chunk)

            while "\n" in buf:
                line, buf = buf.split("\n", 1)
                line = line.rstrip("\r")
                sse = decoder.decode(line)
                if sse is not None:
                    yield sse

        # Flush any remaining bytes from the incremental decoder
        buf += text_decoder.decode(b"", final=True)

        if buf.strip():
            line = buf.rstrip("\r")
            sse = decoder.decode(line)
            if sse is not None:
                yield sse

    async def aiter_sse(self) -> AsyncGenerator[ServerSentEvent, None]:
        self._check_content_type()
        decoder = SSEDecoder()
        charset = self._get_charset()
        text_decoder = codecs.getincrementaldecoder(charset)(errors="replace")

        buf = ""
        async for chunk in self._response.aiter_bytes():
            buf += text_decoder.decode(chunk)

            while "\n" in buf:
                line, buf = buf.split("\n", 1)
                line = line.rstrip("\r")
                sse = decoder.decode(line)
                if sse is not None:
                    yield sse

        # Flush any remaining bytes from the incremental decoder
        buf += text_decoder.decode(b"", final=True)

        if buf.strip():
            line = buf.rstrip("\r")
            sse = decoder.decode(line)
            if sse is not None:
                yield sse


@contextmanager
def connect_sse(client: httpx.Client, method: str, url: str, **kwargs: Any) -> Iterator[EventSource]:
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
