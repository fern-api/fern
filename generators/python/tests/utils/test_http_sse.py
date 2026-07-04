import asyncio
import json
import threading
import time
from contextlib import asynccontextmanager, contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, AsyncIterator, Callable, Iterator, List, Optional, Sequence, cast
from unittest.mock import AsyncMock, Mock

import httpx
import pytest

import core_utilities.shared.http_sse._api as _sse_api
from core_utilities.shared.http_sse import (
    MAX_LINE_SIZE,
    EventSource,
    ServerSentEvent,
    SSEError,
    aconnect_sse,
    connect_sse,
)


class TestSSEDecoder:
    """Test cases for SSEDecoder with edge cases and complex scenarios."""

    def test_basic_sse_event(self) -> None:
        """Test basic SSE event decoding."""
        sse_stream = "event: test\ndata: hello world\nid: 123\nretry: 5000\n\n"

        # Convert string to bytes for httpx.Response.iter_bytes()
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello world"
        assert events[0].id == "123"
        assert events[0].retry == 5000

    def test_multiple_sse_events_without_final_double_newline(self) -> None:
        """Test multiple SSE events where the final one doesn't end with double newline."""
        # Simulate a real SSE stream where the final event doesn't end with double newline
        # The key is that the incomplete event should still be processed when the stream ends
        chunks = [
            b"event: first\ndata: first data\n\n",
            b"event: second\ndata: second data\n\n",
            b"event: third\ndata: third data\n",  # Has newline but no double newline
        ]

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = chunks

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        # The decoder only returns complete events (those ending with double newline)
        # The third event is incomplete, so it's not returned
        assert len(events) == 2
        assert events[0].event == "first"
        assert events[0].data == "first data"
        assert events[1].event == "second"
        assert events[1].data == "second data"

    def test_sse_event_with_escaped_double_newlines(self) -> None:
        """Test SSE event with escaped double newlines in data."""
        # Test data that contains literal \n characters (escaped newlines) in the content
        sse_stream = "event: multiline\ndata: line1\\nline2\ndata: \\n\\n\ndata: line3\\n\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "multiline"
        # Should preserve the literal \n characters in the data
        assert events[0].data == "line1\\nline2\n\\n\\n\nline3\\n"

    def test_sse_event_with_complex_escaped_content(self) -> None:
        """Test SSE event with complex escaped content including newlines."""
        # Test data with both actual newlines (from multiple data lines) and literal \n characters
        sse_stream = "event: complex\ndata: This is line 1\ndata: This is line 2\ndata: \ndata: This is line 3\ndata: Special chars: \\n \\r \\t\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "complex"
        # Should have actual newlines from multiple data lines AND preserve literal \n characters
        expected_data = "This is line 1\nThis is line 2\n\nThis is line 3\nSpecial chars: \\n \\r \\t"
        assert events[0].data == expected_data

    def test_sse_event_with_null_character_in_id(self) -> None:
        """Test SSE event with null character in id field (should be ignored)."""
        sse_stream = "event: test\ndata: test data\nid: normal_id\nid: id_with_null\0character\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].id == "normal_id"  # Should keep the previous valid id

    def test_sse_event_with_invalid_retry(self) -> None:
        """Test SSE event with invalid retry value."""
        sse_stream = "event: test\ndata: test data\nretry: 5000\nretry: invalid\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].retry == 5000  # Should keep the previous valid retry

    def test_sse_event_with_comment_line(self) -> None:
        """Test SSE event with comment line (starts with colon)."""
        sse_stream = "event: test\ndata: test data\n: this is a comment\ndata: more data\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].data == "test data\nmore data"

    def test_sse_event_with_field_name_space(self) -> None:
        """Test SSE event with field name followed by space."""
        sse_stream = "event: test\ndata: test data\ndata : spaced field\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        # The decoder treats "data :" as a different field name, so it's ignored
        assert events[0].data == "test data"

    def test_sse_event_with_unknown_field(self) -> None:
        """Test SSE event with unknown field (should be ignored)."""
        sse_stream = "event: test\ndata: test data\nunknown: ignored\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "test data"

    def test_empty_sse_event(self) -> None:
        """Test empty SSE event (no fields)."""
        sse_stream = "\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 0

    def test_sse_event_with_only_data(self) -> None:
        """Test SSE event with only data field (default event type)."""
        sse_stream = "data: hello\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == ""  # No event field set, so empty string
        assert events[0].data == "hello"

    def test_multiple_data_lines(self) -> None:
        """Test SSE event with multiple data lines."""
        sse_stream = "data: line1\ndata: line2\ndata: line3\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].data == "line1\nline2\nline3"

    def test_sse_event_with_retry_only(self) -> None:
        """Test SSE event with only retry field."""
        sse_stream = "retry: 3000\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].retry == 3000
        assert events[0].event == ""  # No event field set, so empty string
        assert events[0].data == ""  # Empty data

    def test_sse_event_preserves_last_event_id(self) -> None:
        """Test that last event id is preserved across events."""
        sse_stream = "id: first_id\ndata: first data\n\ndata: second data\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 2
        assert events[0].id == "first_id"
        assert events[1].id == "first_id"  # Should preserve last event id


class TestEventSource:
    """Test cases for EventSource class."""

    def test_content_type_validation(self) -> None:
        """Test content type validation."""
        # Valid content type
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        event_source = EventSource(response)

        # Should not raise exception
        event_source._check_content_type()

        # Invalid content type
        response.headers = {"content-type": "application/json"}
        with pytest.raises(SSEError, match="Expected response header Content-Type to contain 'text/event-stream'"):
            event_source._check_content_type()

    def test_content_type_with_charset(self) -> None:
        """Test content type with charset parameter."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream; charset=utf-8"}
        event_source = EventSource(response)

        # Should not raise exception
        event_source._check_content_type()

        # Should detect charset correctly
        assert event_source._get_charset() == "utf-8"

    def test_charset_detection_utf16(self) -> None:
        """Test charset detection for UTF-16."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream; charset=utf-16"}
        event_source = EventSource(response)

        # Should not raise exception
        event_source._check_content_type()

        assert event_source._get_charset() == "utf-16"

    def test_charset_detection_iso8859(self) -> None:
        """Test charset detection for ISO-8859-1."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream; charset=iso-8859-1"}
        event_source = EventSource(response)

        # Should not raise exception
        event_source._check_content_type()

        assert event_source._get_charset() == "iso-8859-1"

    def test_charset_detection_quoted(self) -> None:
        """Test charset detection with quoted charset."""
        response = Mock()
        response.headers = {"content-type": 'text/event-stream; charset="utf-8"'}
        event_source = EventSource(response)

        # Should not raise exception
        event_source._check_content_type()

        assert event_source._get_charset() == "utf-8"

    def test_charset_detection_invalid_fallback(self) -> None:
        """Test charset detection with invalid charset falls back to UTF-8."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream; charset=invalid-charset"}
        event_source = EventSource(response)

        # Should not raise exception
        event_source._check_content_type()

        # Should detect charset correctly
        assert event_source._get_charset() == "utf-8"

    def test_charset_detection_no_charset(self) -> None:
        """Test charset detection with no charset specified falls back to UTF-8."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        event_source = EventSource(response)

        # Should not raise exception
        event_source._check_content_type()

        assert event_source._get_charset() == "utf-8"

    def test_sse_with_utf16_encoding(self) -> None:
        """Test SSE processing with UTF-16 encoding."""
        # Create UTF-16 encoded SSE data
        sse_data = "event: test\ndata: hello world\n\n"
        utf16_bytes = sse_data.encode("utf-16")

        response = Mock()
        response.headers = {"content-type": "text/event-stream; charset=utf-16"}
        response.iter_bytes.return_value = [utf16_bytes]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello world"

    def test_sse_with_iso8859_encoding(self) -> None:
        """Test SSE processing with ISO-8859-1 encoding."""
        # Create ISO-8859-1 encoded SSE data
        sse_data = "event: test\ndata: café\n\n"
        iso_bytes = sse_data.encode("iso-8859-1")

        response = Mock()
        response.headers = {"content-type": "text/event-stream; charset=iso-8859-1"}
        response.iter_bytes.return_value = [iso_bytes]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "café"

    def test_iter_sse_basic(self) -> None:
        """Test basic SSE iteration."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [b"event: test\n", b"data: hello\n", b"data: world\n", b"\n"]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello\nworld"

    def test_iter_sse_multiple_events(self) -> None:
        """Test SSE iteration with multiple events."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [
            b"event: first\n",
            b"data: first data\n",
            b"\n",
            b"event: second\n",
            b"data: second data\n",
            b"\n",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 2
        assert events[0].event == "first"
        assert events[0].data == "first data"
        assert events[1].event == "second"
        assert events[1].data == "second data"

    def test_iter_sse_with_remaining_buffer(self) -> None:
        """Test SSE iteration with remaining buffer data."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [
            b"event: test\n",
            b"data: hello\n",
            b"data: world\n",
            b"\n",
            b"asdlkjfa;skdjf",  # Extra buffer that shouldn't be processed
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello\nworld"

    def test_iter_sse_with_utf8_errors(self) -> None:
        """Test SSE iteration with UTF-8 decoding errors."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        # Include invalid UTF-8 bytes
        response.iter_bytes.return_value = [
            b"event: test\n",
            b"data: hello\xffworld\n",  # Invalid UTF-8
            b"\n",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        # Should handle UTF-8 errors gracefully
        assert "hello" in events[0].data

    @pytest.mark.asyncio
    async def test_aiter_sse_basic(self) -> None:
        """Test basic async SSE iteration."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield b"event: test\ndata: hello\ndata: world\n\n"

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello\nworld"

    @pytest.mark.asyncio
    async def test_aiter_sse_multiple_events(self) -> None:
        """Test async SSE iteration with multiple events."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield b"event: first\ndata: first data\n\n"
            yield b"event: second\ndata: second data\n\n"

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 2
        assert events[0].event == "first"
        assert events[0].data == "first data"
        assert events[1].event == "second"
        assert events[1].data == "second data"

    @pytest.mark.asyncio
    async def test_aiter_sse_cleanup(self) -> None:
        """Test that async SSE iteration properly closes the async generator."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield b"data: test\n\n"

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)

        # Should process events correctly
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        assert events[0].data == "test"

    @pytest.mark.asyncio
    async def test_aiter_sse_preserves_unicode_line_separators(self) -> None:
        """Test that \u2028 and \u2029 in data fields are preserved, not treated as line breaks."""
        json_with_separators = '{"text": "before\u2028after\u2029end"}'
        sse_payload = f"data: {json_with_separators}\n\n".encode("utf-8")

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield sse_payload

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        parsed = events[0].json()
        assert parsed["text"] == "before\u2028after\u2029end"

    def test_iter_sse_preserves_unicode_line_separators(self) -> None:
        """Test that \u2028 and \u2029 in data fields are preserved in sync iteration."""
        json_with_separators = '{"text": "before\u2028after\u2029end"}'
        sse_payload = f"data: {json_with_separators}\n\n".encode("utf-8")

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_payload]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        parsed = events[0].json()
        assert parsed["text"] == "before\u2028after\u2029end"

    @pytest.mark.asyncio
    async def test_aiter_sse_preserves_all_splitlines_chars(self) -> None:
        """Test that all characters Python's str.splitlines() treats as line breaks
        (beyond \\n, \\r, \\r\\n) are preserved in SSE data fields.

        str.splitlines() splits on: \\v(\\x0b), \\f(\\x0c), \\x1c, \\x1d, \\x1e,
        \\x85, \\u2028, \\u2029. Only \\n, \\r, \\r\\n are valid SSE terminators.
        """
        problematic_chars = "\x0b\x0c\x1c\x1d\x1e\x85\u2028\u2029"
        data_value = f"before{problematic_chars}after"
        sse_payload = f"data: {data_value}\n\n".encode("utf-8")

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield sse_payload

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        assert events[0].data == data_value

    def test_iter_sse_preserves_all_splitlines_chars(self) -> None:
        """Sync version: all str.splitlines() chars are preserved."""
        problematic_chars = "\x0b\x0c\x1c\x1d\x1e\x85\u2028\u2029"
        data_value = f"before{problematic_chars}after"
        sse_payload = f"data: {data_value}\n\n".encode("utf-8")

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_payload]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].data == data_value

    @pytest.mark.asyncio
    async def test_aiter_sse_handles_crlf_line_endings(self) -> None:
        """Test that \\r\\n line endings (valid SSE terminators) are handled correctly."""
        sse_payload = b"event: test\r\ndata: hello\r\ndata: world\r\n\r\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield sse_payload

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello\nworld"

    @pytest.mark.asyncio
    async def test_aiter_sse_chunk_boundary_splitting(self) -> None:
        """Test that SSE events split across chunk boundaries are correctly reassembled."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            # Split the event across multiple chunks at arbitrary points
            yield b"event: te"
            yield b"st\nda"
            yield b"ta: hel"
            yield b"lo\n\n"

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello"

    @pytest.mark.asyncio
    async def test_aiter_sse_unicode_in_chunked_data(self) -> None:
        """Test that multi-byte UTF-8 sequences split across chunk boundaries
        are decoded correctly (not replaced with \\ufffd).

        \\u2028 encodes as \\xe2\\x80\\xa8 in UTF-8. We split inside this
        3-byte sequence to verify the bytes buffer handles it.
        """
        json_payload = '{"content": "line1\u2028line2\u2029line3"}'
        full_sse = f"data: {json_payload}\n\n".encode("utf-8")
        # Find the UTF-8 byte sequence for \u2028 (b'\xe2\x80\xa8') and split inside it
        u2028_bytes = "\u2028".encode("utf-8")  # b'\xe2\x80\xa8'
        split_pos = full_sse.index(u2028_bytes) + 1  # split after first byte of the 3-byte sequence

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield full_sse[:split_pos]
            yield full_sse[split_pos:]

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        parsed = events[0].json()
        assert parsed["content"] == "line1\u2028line2\u2029line3"

    def test_iter_sse_multibyte_split_across_chunks(self) -> None:
        """Test that multi-byte UTF-8 sequences split across chunks work in sync iteration too."""
        text = "data: hello\u2028world\n\n"
        encoded = text.encode("utf-8")
        # Split inside the \u2028 3-byte sequence
        u2028_bytes = "\u2028".encode("utf-8")
        split_pos = encoded.index(u2028_bytes) + 1

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [encoded[:split_pos], encoded[split_pos:]]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].data == "hello\u2028world"

    @pytest.mark.asyncio
    async def test_aiter_sse_bare_cr_line_terminator(self) -> None:
        """Test that bare \\r is handled as a line terminator per SSE spec."""
        sse_payload = b"data: hello\rdata: world\r\r"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield sse_payload

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        assert events[0].data == "hello\nworld"

    def test_iter_sse_bare_cr_line_terminator(self) -> None:
        """Test that bare \\r is handled as a line terminator in sync iteration."""
        sse_payload = b"data: hello\rdata: world\r\r"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_payload]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].data == "hello\nworld"

    @pytest.mark.asyncio
    async def test_aiter_sse_crlf_across_chunk_boundary(self) -> None:
        """Test that \\r\\n split across chunks (\\r at end, \\n at start) is one terminator."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield b"data: hello\r"
            yield b"\ndata: world\n\n"

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        assert events[0].data == "hello\nworld"

    @pytest.mark.asyncio
    async def test_aiter_sse_bare_cr_across_chunk_boundary(self) -> None:
        """Test that bare \\r at chunk end (not followed by \\n) acts as a terminator."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield b"data: hello\r"
            yield b"data: world\n\n"

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        assert events[0].data == "hello\nworld"


class TestConnectSSE:
    """Test cases for connect_sse and aconnect_sse functions."""

    def test_connect_sse_headers(self) -> None:
        """Test that connect_sse sets proper headers."""
        client = Mock()
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [b"data: test\n\n"]

        # Mock the context manager
        context_manager = Mock()
        context_manager.__enter__ = Mock(return_value=response)
        context_manager.__exit__ = Mock(return_value=None)
        client.stream.return_value = context_manager

        with connect_sse(client, "GET", "http://example.com/sse") as event_source:
            assert isinstance(event_source, EventSource)

        # Check that proper headers were set
        client.stream.assert_called_once()
        call_args = client.stream.call_args
        assert call_args[1]["headers"]["Accept"] == "text/event-stream"
        assert call_args[1]["headers"]["Cache-Control"] == "no-store"

    def test_connect_sse_with_custom_headers(self) -> None:
        """Test that connect_sse preserves custom headers."""
        client = Mock()
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [b"data: test\n\n"]

        # Mock the context manager
        context_manager = Mock()
        context_manager.__enter__ = Mock(return_value=response)
        context_manager.__exit__ = Mock(return_value=None)
        client.stream.return_value = context_manager

        custom_headers = {"Authorization": "Bearer token"}

        with connect_sse(client, "GET", "http://example.com/sse", headers=custom_headers) as event_source:
            assert isinstance(event_source, EventSource)

        # Check that custom headers are preserved and SSE headers are added
        call_args = client.stream.call_args
        headers = call_args[1]["headers"]
        assert headers["Accept"] == "text/event-stream"
        assert headers["Cache-Control"] == "no-store"
        assert headers["Authorization"] == "Bearer token"

    @pytest.mark.asyncio
    async def test_aconnect_sse_headers(self) -> None:
        """Test that aconnect_sse sets proper headers."""
        client = Mock()
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield b"data: test\n\n"

        response.aiter_bytes = mock_aiter_bytes

        # Mock the async context manager
        async_context_manager = Mock()
        async_context_manager.__aenter__ = AsyncMock(return_value=response)
        async_context_manager.__aexit__ = AsyncMock(return_value=None)
        client.stream.return_value = async_context_manager

        async with aconnect_sse(client, "GET", "http://example.com/sse") as event_source:
            assert isinstance(event_source, EventSource)

        # Check that proper headers were set
        client.stream.assert_called_once()
        call_args = client.stream.call_args
        assert call_args[1]["headers"]["Accept"] == "text/event-stream"
        assert call_args[1]["headers"]["Cache-Control"] == "no-store"

    @pytest.mark.asyncio
    async def test_aconnect_sse_with_custom_headers(self) -> None:
        """Test that aconnect_sse preserves custom headers."""
        client = Mock()
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield b"data: test\n\n"

        response.aiter_bytes = mock_aiter_bytes

        # Mock the async context manager
        async_context_manager = Mock()
        async_context_manager.__aenter__ = AsyncMock(return_value=response)
        async_context_manager.__aexit__ = AsyncMock(return_value=None)
        client.stream.return_value = async_context_manager

        custom_headers = {"Authorization": "Bearer token"}

        async with aconnect_sse(client, "GET", "http://example.com/sse", headers=custom_headers) as event_source:
            assert isinstance(event_source, EventSource)

        # Check that custom headers are preserved and SSE headers are added
        call_args = client.stream.call_args
        headers = call_args[1]["headers"]
        assert headers["Accept"] == "text/event-stream"
        assert headers["Cache-Control"] == "no-store"
        assert headers["Authorization"] == "Bearer token"


class TestServerSentEvent:
    """Test cases for ServerSentEvent model."""

    def test_default_values(self) -> None:
        """Test default values for ServerSentEvent."""
        event = ServerSentEvent()

        assert event.event == "message"
        assert event.data == ""
        assert event.id == ""
        assert event.retry is None

    def test_custom_values(self) -> None:
        """Test custom values for ServerSentEvent."""
        event = ServerSentEvent(event="custom", data="test data", id="123", retry=5000)

        assert event.event == "custom"
        assert event.data == "test data"
        assert event.id == "123"
        assert event.retry == 5000

    def test_json_parsing(self) -> None:
        """Test JSON parsing of data field."""
        event = ServerSentEvent(data='{"key": "value", "number": 42}')

        json_data = event.json()
        assert json_data == {"key": "value", "number": 42}

    def test_json_parsing_invalid_json(self) -> None:
        """Test JSON parsing with invalid JSON data."""
        event = ServerSentEvent(data="invalid json")

        with pytest.raises(json.JSONDecodeError):
            event.json()

    def test_immutability(self) -> None:
        """Test that ServerSentEvent is immutable."""
        event = ServerSentEvent(event="test", data="data")

        with pytest.raises(AttributeError):
            event.event = "modified"  # type: ignore[misc]

        with pytest.raises(AttributeError):
            event.data = "modified"  # type: ignore[misc]


class TestSSEError:
    """Test cases for SSEError exception."""

    def test_sse_error_inheritance(self) -> None:
        """Test that SSEError inherits from httpx.TransportError."""
        error = SSEError("test error")

        assert isinstance(error, httpx.TransportError)
        assert str(error) == "test error"

    def test_sse_error_with_custom_message(self) -> None:
        """Test SSEError with custom message."""
        message = "Custom SSE error message"
        error = SSEError(message)

        assert str(error) == message


class TestMaxLineSize:
    """Test the MAX_LINE_SIZE guard against unbounded buffer growth (GHSA-7w2x-r9r4-7v8r)."""

    def test_sync_oversized_line_raises(self) -> None:
        """A stream of non-newline bytes exceeding MAX_LINE_SIZE raises SSEError."""
        oversized_chunk = b"x" * (MAX_LINE_SIZE + 1)

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [oversized_chunk]

        event_source = EventSource(response)
        with pytest.raises(SSEError, match="exceeded maximum size"):
            list(event_source.iter_sse())

    def test_sync_oversized_across_multiple_chunks_raises(self) -> None:
        """Buffer accumulated across many small chunks still triggers the guard."""
        chunk_size = 4096
        num_chunks = (MAX_LINE_SIZE // chunk_size) + 2
        chunks = [b"A" * chunk_size for _ in range(num_chunks)]

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = chunks

        event_source = EventSource(response)
        with pytest.raises(SSEError, match="exceeded maximum size"):
            list(event_source.iter_sse())

    def test_sync_line_exactly_at_limit_passes(self) -> None:
        """A line of exactly MAX_LINE_SIZE characters (terminated by newline) parses fine."""
        line = "data: " + "y" * (MAX_LINE_SIZE - len("data: ")) + "\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [line.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())
        assert len(events) == 1

    def test_sync_normal_stream_still_parses(self) -> None:
        """Normal SSE streams with reasonable line lengths parse correctly."""
        sse_stream = "event: ping\ndata: hello world\nid: 1\n\nevent: pong\ndata: goodbye\n\n"

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [sse_stream.encode("utf-8")]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 2
        assert events[0].event == "ping"
        assert events[0].data == "hello world"
        assert events[1].event == "pong"
        assert events[1].data == "goodbye"

    def test_sync_oversized_trailing_buffer_raises(self) -> None:
        """Oversized trailing data after stream close also triggers the guard."""
        # First chunk has a valid event, second is an oversized trailing buffer
        valid_event = b"data: ok\n\n"
        oversized_trailing = b"x" * (MAX_LINE_SIZE + 1)

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_bytes.return_value = [valid_event, oversized_trailing]

        event_source = EventSource(response)
        with pytest.raises(SSEError, match="exceeded maximum size"):
            list(event_source.iter_sse())

    @pytest.mark.asyncio
    async def test_async_oversized_line_raises(self) -> None:
        """Async variant: non-newline bytes exceeding MAX_LINE_SIZE raises SSEError."""
        oversized_chunk = b"x" * (MAX_LINE_SIZE + 1)

        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield oversized_chunk

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        with pytest.raises(SSEError, match="exceeded maximum size"):
            events = []
            async for event in event_source.aiter_sse():
                events.append(event)

    @pytest.mark.asyncio
    async def test_async_normal_stream_still_parses(self) -> None:
        """Async variant: normal SSE streams parse correctly."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        async def mock_aiter_bytes() -> AsyncIterator[bytes]:
            yield b"event: ping\ndata: hello\n\n"
            yield b"event: pong\ndata: world\n\n"

        response.aiter_bytes = mock_aiter_bytes

        event_source = EventSource(response)
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 2
        assert events[0].event == "ping"
        assert events[0].data == "hello"
        assert events[1].event == "pong"
        assert events[1].data == "world"


# ---------------------------------------------------------------------------
# SSE stream reconnection
# ---------------------------------------------------------------------------

TERMINATOR = "[DONE]"


class _FakeResponse:
    """Minimal stand-in for ``httpx.Response`` that streams predefined chunks."""

    def __init__(self, chunks: List[bytes], content_type: str = "text/event-stream") -> None:
        self.headers = {"content-type": content_type}
        self._chunks = chunks

    def iter_bytes(self) -> Iterator[bytes]:
        for chunk in self._chunks:
            yield chunk

    async def aiter_bytes(self) -> AsyncIterator[bytes]:
        for chunk in self._chunks:
            yield chunk


def _sse(*events: str) -> _FakeResponse:
    return _FakeResponse([e.encode("utf-8") for e in events])


class _SyncReconnector:
    """Records reconnect calls and hands out a queue of streams (or ``None``)."""

    def __init__(self, streams: Sequence[Optional[_FakeResponse]]) -> None:
        self._streams = streams
        self.calls: List[str] = []

    def __call__(self, last_event_id: str):  # type: ignore[no-untyped-def]
        index = len(self.calls)
        self.calls.append(last_event_id)
        response = self._streams[index] if index < len(self._streams) else None

        @contextmanager
        def _cm() -> Iterator[Optional[_FakeResponse]]:
            yield response

        return _cm()


class _AsyncReconnector:
    def __init__(self, streams: Sequence[Optional[_FakeResponse]]) -> None:
        self._streams = streams
        self.calls: List[str] = []

    def __call__(self, last_event_id: str):  # type: ignore[no-untyped-def]
        index = len(self.calls)
        self.calls.append(last_event_id)
        response = self._streams[index] if index < len(self._streams) else None

        @asynccontextmanager
        async def _cm() -> AsyncIterator[Optional[_FakeResponse]]:
            yield response

        return _cm()


def _collect_sync(event_source: EventSource, terminator: Optional[str] = TERMINATOR) -> List[str]:
    """Consume like generated SDK code: stop when the terminator event arrives."""
    data: List[str] = []
    for sse in event_source.iter_sse():
        if terminator is not None and sse.data == terminator:
            break
        data.append(sse.data)
    return data


async def _collect_async(event_source: EventSource, terminator: Optional[str] = TERMINATOR) -> List[str]:
    data: List[str] = []
    async for sse in event_source.aiter_sse():
        if terminator is not None and sse.data == terminator:
            break
        data.append(sse.data)
    return data


@pytest.fixture(autouse=True)
def _fast_reconnect_delay(monkeypatch: "pytest.MonkeyPatch") -> None:
    """Shrink the default reconnect backoff so timing-agnostic tests stay fast."""
    monkeypatch.setattr(_sse_api, "DEFAULT_RECONNECT_DELAY_MS", 10)


def _resumable_source(
    response: _FakeResponse,
    reconnect: Optional[Callable[[str], Any]],
    *,
    stream_reconnection_enabled: bool = True,
    max_stream_reconnection_attempts: Optional[int] = None,
    resumable: bool = True,
    stream_terminator: Optional[str] = TERMINATOR,
) -> EventSource:
    return EventSource(
        cast(httpx.Response, response),
        resumable=resumable,
        stream_reconnection_enabled=stream_reconnection_enabled,
        max_stream_reconnection_attempts=max_stream_reconnection_attempts,
        stream_terminator=stream_terminator,
        reconnect=reconnect,
    )


class TestSSEReconnectionSync:
    def test_reconnects_with_last_event_id(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n', 'id: 2\ndata: {"value": 2}\n\n')
        second = _sse('id: 3\ndata: {"value": 3}\n\n', "data: [DONE]\n\n")
        reconnect = _SyncReconnector([second])

        source = _resumable_source(first, reconnect)
        data = _collect_sync(source)

        assert data == ['{"value": 1}', '{"value": 2}', '{"value": 3}']
        assert reconnect.calls == ["2"]

    def test_reconnects_from_last_dispatched_id_not_parsed_id(self) -> None:
        # evt-2's id: line is parsed but the stream drops before evt-2's data +
        # blank line, so evt-2 is never dispatched. Reconnection must resume
        # from evt-1 or evt-2 would be silently skipped.
        first = _sse('id: evt-1\ndata: {"value": 1}\n\n', "id: evt-2\n")
        second = _sse('id: evt-2\ndata: {"value": 2}\n\n', "data: [DONE]\n\n")
        reconnect = _SyncReconnector([second])

        source = _resumable_source(first, reconnect)
        data = _collect_sync(source)

        assert data == ['{"value": 1}', '{"value": 2}']
        assert reconnect.calls == ["evt-1"]

    def test_multiple_sequential_reconnects(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        streams = [
            _sse('id: 2\ndata: {"value": 2}\n\n'),
            _sse('id: 3\ndata: {"value": 3}\n\n', "data: [DONE]\n\n"),
        ]
        reconnect = _SyncReconnector(streams)

        source = _resumable_source(first, reconnect)
        data = _collect_sync(source)

        assert data == ['{"value": 1}', '{"value": 2}', '{"value": 3}']
        assert reconnect.calls == ["1", "2"]

    def test_no_terminator_disables_reconnect(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _SyncReconnector([_sse('id: 2\ndata: {"value": 2}\n\n')])

        source = _resumable_source(first, reconnect, stream_terminator=None)
        data = _collect_sync(source, terminator=None)

        assert data == ['{"value": 1}']
        assert reconnect.calls == []

    def test_reconnection_disabled_flag(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _SyncReconnector([_sse("data: [DONE]\n\n")])

        source = _resumable_source(first, reconnect, stream_reconnection_enabled=False)
        data = _collect_sync(source)

        assert data == ['{"value": 1}']
        assert reconnect.calls == []

    def test_not_resumable_disables_reconnect(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _SyncReconnector([_sse("data: [DONE]\n\n")])

        source = _resumable_source(first, reconnect, resumable=False)
        data = _collect_sync(source)

        assert data == ['{"value": 1}']
        assert reconnect.calls == []

    def test_no_reconnect_callback(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        source = _resumable_source(first, None)
        data = _collect_sync(source)
        assert data == ['{"value": 1}']

    def test_no_last_id_disables_reconnect(self) -> None:
        first = _sse('data: {"value": 1}\n\n')
        reconnect = _SyncReconnector([_sse("data: [DONE]\n\n")])

        source = _resumable_source(first, reconnect)
        data = _collect_sync(source)

        assert data == ['{"value": 1}']
        assert reconnect.calls == []

    def test_max_reconnection_attempts_cap(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        # Server is down: every reconnect yields an empty stream.
        reconnect = _SyncReconnector([_sse(), _sse(), _sse(), _sse(), _sse()])

        source = _resumable_source(first, reconnect, max_stream_reconnection_attempts=3)
        data = _collect_sync(source)

        assert data == ['{"value": 1}']
        assert len(reconnect.calls) == 3

    def test_attempts_reset_on_progress(self) -> None:
        # max=1, but each reconnect yields an event which resets the counter,
        # so all events arrive despite the low cap.
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        streams = [
            _sse('id: 2\ndata: {"value": 2}\n\n'),
            _sse('id: 3\ndata: {"value": 3}\n\n', "data: [DONE]\n\n"),
        ]
        reconnect = _SyncReconnector(streams)

        source = _resumable_source(first, reconnect, max_stream_reconnection_attempts=1)
        data = _collect_sync(source)

        assert data == ['{"value": 1}', '{"value": 2}', '{"value": 3}']
        assert reconnect.calls == ["1", "2"]

    def test_clean_terminator_does_not_reconnect(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n', "data: [DONE]\n\n")
        reconnect = _SyncReconnector([_sse("data: [DONE]\n\n")])

        source = _resumable_source(first, reconnect)
        data = _collect_sync(source)

        assert data == ['{"value": 1}']
        assert reconnect.calls == []

    def test_null_reconnect_body_counts_as_failed_attempt(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _SyncReconnector([None, None])

        source = _resumable_source(first, reconnect, max_stream_reconnection_attempts=2)
        data = _collect_sync(source)

        assert data == ['{"value": 1}']
        assert len(reconnect.calls) == 2


class TestSSEReconnectionAsync:
    @pytest.mark.asyncio
    async def test_reconnects_with_last_event_id(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n', 'id: 2\ndata: {"value": 2}\n\n')
        second = _sse('id: 3\ndata: {"value": 3}\n\n', "data: [DONE]\n\n")
        reconnect = _AsyncReconnector([second])

        source = _resumable_source(first, reconnect)
        data = await _collect_async(source)

        assert data == ['{"value": 1}', '{"value": 2}', '{"value": 3}']
        assert reconnect.calls == ["2"]

    @pytest.mark.asyncio
    async def test_reconnects_from_last_dispatched_id_not_parsed_id(self) -> None:
        first = _sse('id: evt-1\ndata: {"value": 1}\n\n', "id: evt-2\n")
        second = _sse('id: evt-2\ndata: {"value": 2}\n\n', "data: [DONE]\n\n")
        reconnect = _AsyncReconnector([second])

        source = _resumable_source(first, reconnect)
        data = await _collect_async(source)

        assert data == ['{"value": 1}', '{"value": 2}']
        assert reconnect.calls == ["evt-1"]

    @pytest.mark.asyncio
    async def test_multiple_sequential_reconnects(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        streams = [
            _sse('id: 2\ndata: {"value": 2}\n\n'),
            _sse('id: 3\ndata: {"value": 3}\n\n', "data: [DONE]\n\n"),
        ]
        reconnect = _AsyncReconnector(streams)

        source = _resumable_source(first, reconnect)
        data = await _collect_async(source)

        assert data == ['{"value": 1}', '{"value": 2}', '{"value": 3}']
        assert reconnect.calls == ["1", "2"]

    @pytest.mark.asyncio
    async def test_no_terminator_disables_reconnect(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _AsyncReconnector([_sse('id: 2\ndata: {"value": 2}\n\n')])

        source = _resumable_source(first, reconnect, stream_terminator=None)
        data = await _collect_async(source, terminator=None)

        assert data == ['{"value": 1}']
        assert reconnect.calls == []

    @pytest.mark.asyncio
    async def test_reconnection_disabled_flag(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _AsyncReconnector([_sse("data: [DONE]\n\n")])

        source = _resumable_source(first, reconnect, stream_reconnection_enabled=False)
        data = await _collect_async(source)

        assert data == ['{"value": 1}']
        assert reconnect.calls == []

    @pytest.mark.asyncio
    async def test_not_resumable_disables_reconnect(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _AsyncReconnector([_sse("data: [DONE]\n\n")])

        source = _resumable_source(first, reconnect, resumable=False)
        data = await _collect_async(source)

        assert data == ['{"value": 1}']
        assert reconnect.calls == []

    @pytest.mark.asyncio
    async def test_max_reconnection_attempts_cap(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _AsyncReconnector([_sse(), _sse(), _sse(), _sse(), _sse()])

        source = _resumable_source(first, reconnect, max_stream_reconnection_attempts=3)
        data = await _collect_async(source)

        assert data == ['{"value": 1}']
        assert len(reconnect.calls) == 3

    @pytest.mark.asyncio
    async def test_attempts_reset_on_progress(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        streams = [
            _sse('id: 2\ndata: {"value": 2}\n\n'),
            _sse('id: 3\ndata: {"value": 3}\n\n', "data: [DONE]\n\n"),
        ]
        reconnect = _AsyncReconnector(streams)

        source = _resumable_source(first, reconnect, max_stream_reconnection_attempts=1)
        data = await _collect_async(source)

        assert data == ['{"value": 1}', '{"value": 2}', '{"value": 3}']
        assert reconnect.calls == ["1", "2"]

    @pytest.mark.asyncio
    async def test_clean_terminator_does_not_reconnect(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n', "data: [DONE]\n\n")
        reconnect = _AsyncReconnector([_sse("data: [DONE]\n\n")])

        source = _resumable_source(first, reconnect)
        data = await _collect_async(source)

        assert data == ['{"value": 1}']
        assert reconnect.calls == []

    @pytest.mark.asyncio
    async def test_null_reconnect_body_counts_as_failed_attempt(self) -> None:
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _AsyncReconnector([None, None])

        source = _resumable_source(first, reconnect, max_stream_reconnection_attempts=2)
        data = await _collect_async(source)

        assert data == ['{"value": 1}']
        assert len(reconnect.calls) == 2


class TestSSEReconnectionBackoff:
    def test_default_delay_when_no_retry(self) -> None:
        source = EventSource(cast(httpx.Response, _sse()), resumable=True, stream_terminator=TERMINATOR)
        # Reads the module default (not the shrunk test value) via a fresh source.
        assert source._reconnect_delay_seconds(None) == _sse_api.DEFAULT_RECONNECT_DELAY_MS / 1000.0

    def test_zero_retry_falls_back_to_default(self) -> None:
        source = EventSource(cast(httpx.Response, _sse()), resumable=True, stream_terminator=TERMINATOR)
        assert source._reconnect_delay_seconds(0) == _sse_api.DEFAULT_RECONNECT_DELAY_MS / 1000.0

    def test_server_retry_directive_respected(self) -> None:
        source = EventSource(cast(httpx.Response, _sse()), resumable=True, stream_terminator=TERMINATOR)
        assert source._reconnect_delay_seconds(250) == 0.25

    def test_server_retry_clamped_to_max(self) -> None:
        source = EventSource(cast(httpx.Response, _sse()), resumable=True, stream_terminator=TERMINATOR)
        assert source._reconnect_delay_seconds(120_000) == _sse_api.MAX_RECONNECT_DELAY_MS / 1000.0

    def test_backoff_elapses_between_reconnects(self, monkeypatch: "pytest.MonkeyPatch") -> None:
        monkeypatch.setattr(_sse_api, "DEFAULT_RECONNECT_DELAY_MS", 120)
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        streams = [
            _sse('id: 2\ndata: {"value": 2}\n\n'),
            _sse('id: 3\ndata: {"value": 3}\n\n', "data: [DONE]\n\n"),
        ]
        reconnect = _SyncReconnector(streams)
        source = _resumable_source(first, reconnect)

        start = time.monotonic()
        data = _collect_sync(source)
        elapsed = time.monotonic() - start

        assert data == ['{"value": 1}', '{"value": 2}', '{"value": 3}']
        # Two reconnects at ~120ms each.
        assert elapsed >= 0.2

    def test_server_retry_used_instead_of_default(self, monkeypatch: "pytest.MonkeyPatch") -> None:
        # Large default; server retry of 30ms should win, so the reconnect
        # happens quickly rather than after the default.
        monkeypatch.setattr(_sse_api, "DEFAULT_RECONNECT_DELAY_MS", 5_000)
        first = _sse('retry: 30\nid: 1\ndata: {"value": 1}\n\n')
        reconnect = _SyncReconnector([_sse('id: 2\ndata: {"value": 2}\n\n', "data: [DONE]\n\n")])
        source = _resumable_source(first, reconnect)

        start = time.monotonic()
        data = _collect_sync(source)
        elapsed = time.monotonic() - start

        assert data == ['{"value": 1}', '{"value": 2}']
        assert reconnect.calls == ["1"]
        assert elapsed < 1.0


class TestSSEReconnectionCancellation:
    def test_sync_backoff_is_interruptible(self, monkeypatch: "pytest.MonkeyPatch") -> None:
        # A sync consumer blocks inside ``next()`` during the backoff, so the
        # realistic interruption is a signal (e.g. Ctrl-C) raised out of
        # ``time.sleep``. It must propagate and abort the reconnect rather than
        # being swallowed, and no further request may be issued.
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _SyncReconnector([_sse("data: [DONE]\n\n")])
        source = _resumable_source(first, reconnect)

        def _interrupt(_self: EventSource, _last_retry: Optional[int]) -> None:
            raise KeyboardInterrupt

        monkeypatch.setattr(_sse_api.EventSource, "_sleep_before_reconnect", _interrupt)

        collected: List[str] = []
        with pytest.raises(KeyboardInterrupt):
            for sse in source.iter_sse():
                collected.append(sse.data)

        assert collected == ['{"value": 1}']
        # Interrupted during the backoff, before any reconnect was issued.
        assert reconnect.calls == []

    @pytest.mark.asyncio
    async def test_async_cancellation_during_backoff(self, monkeypatch: "pytest.MonkeyPatch") -> None:
        monkeypatch.setattr(_sse_api, "DEFAULT_RECONNECT_DELAY_MS", 2_000)
        first = _sse('id: 1\ndata: {"value": 1}\n\n')
        reconnect = _AsyncReconnector([_sse("data: [DONE]\n\n")])
        source = _resumable_source(first, reconnect)

        collected: List[str] = []

        async def _consume() -> None:
            async for sse in source.aiter_sse():
                if sse.data == TERMINATOR:
                    break
                collected.append(sse.data)

        task = asyncio.ensure_future(_consume())
        # Let the first event flush, then cancel while it is in reconnect backoff.
        await asyncio.sleep(0.1)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task

        assert collected == ['{"value": 1}']
        assert reconnect.calls == []


# ---------------------------------------------------------------------------
# End-to-end reconnection over a real HTTP socket
# ---------------------------------------------------------------------------
#
# Unit tests above drive ``EventSource`` with in-memory fakes. These exercise
# the full stack against a real ``httpx.Client``/``AsyncClient`` and a real
# local HTTP server that deliberately drops the connection mid-stream, so the
# client must transparently reconnect using the ``Last-Event-ID`` header — the
# same code path a generated SDK runs. This is the setup that surfaced a bug the
# in-memory fakes could not: a fully-consumed real stream reports
# ``is_closed=True``, which must NOT be mistaken for consumer cancellation.

_E2E_TERMINATOR = "[DONE]"
_E2E_FINAL_ID = 5


class _DroppingSSEHandler(BaseHTTPRequestHandler):
    """Streams events 1..5 but drops the connection after every 2 events.

    On the first connection it sends ``id: 3`` (parsed) *without* its
    terminating blank line before dropping, so a correct client must resume
    from the last *dispatched* id (2), never the parsed-but-undispatched 3.
    """

    # Records the ``Last-Event-ID`` header seen on each request, in order.
    last_event_ids: List[Optional[str]] = []

    def log_message(self, *args: Any) -> None:  # silence noisy default logging
        pass

    def do_POST(self) -> None:
        last_event_id = self.headers.get("Last-Event-ID")
        type(self).last_event_ids.append(last_event_id)
        start = int(last_event_id) if last_event_id else 0

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.end_headers()

        sent_this_conn = 0
        event_id = start + 1
        while event_id <= _E2E_FINAL_ID:
            if start == 0 and event_id == 3 and sent_this_conn == 2:
                # id: 3 parsed but never dispatched, then drop.
                self.wfile.write(b"id: 3\n")
                self.wfile.flush()
                return
            self.wfile.write(f"id: {event_id}\ndata: event-{event_id}\n\n".encode())
            self.wfile.flush()
            sent_this_conn += 1
            event_id += 1
            if sent_this_conn >= 2 and event_id <= _E2E_FINAL_ID:
                return  # abrupt drop, no terminator -> client must reconnect
        self.wfile.write(f"data: {_E2E_TERMINATOR}\n\n".encode())
        self.wfile.flush()


@contextmanager
def _running_sse_server() -> Iterator[str]:
    _DroppingSSEHandler.last_event_ids = []
    server = ThreadingHTTPServer(("127.0.0.1", 0), _DroppingSSEHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()


class TestSSEReconnectionEndToEnd:
    def test_sync_reconnects_over_real_socket(self, monkeypatch: "pytest.MonkeyPatch") -> None:
        monkeypatch.setattr(_sse_api, "DEFAULT_RECONNECT_DELAY_MS", 10)
        with _running_sse_server() as base_url, httpx.Client() as client:

            def _reconnect(last_event_id: str):  # type: ignore[no-untyped-def]
                return client.stream("POST", base_url, headers={"Last-Event-ID": last_event_id})

            collected: List[str] = []
            with client.stream("POST", base_url) as response:
                source = _resumable_source(cast(Any, response), _reconnect, stream_terminator=_E2E_TERMINATOR)
                collected = _collect_sync(source, terminator=_E2E_TERMINATOR)

        assert collected == ["event-1", "event-2", "event-3", "event-4", "event-5"]
        # Resumed from the last *dispatched* id (2), not the parsed id (3).
        assert _DroppingSSEHandler.last_event_ids == [None, "2", "4"]

    @pytest.mark.asyncio
    async def test_async_reconnects_over_real_socket(self, monkeypatch: "pytest.MonkeyPatch") -> None:
        monkeypatch.setattr(_sse_api, "DEFAULT_RECONNECT_DELAY_MS", 10)
        with _running_sse_server() as base_url:
            async with httpx.AsyncClient() as client:

                def _reconnect(last_event_id: str):  # type: ignore[no-untyped-def]
                    return client.stream("POST", base_url, headers={"Last-Event-ID": last_event_id})

                collected: List[str] = []
                async with client.stream("POST", base_url) as response:
                    source = _resumable_source(cast(Any, response), _reconnect, stream_terminator=_E2E_TERMINATOR)
                    collected = await _collect_async(source, terminator=_E2E_TERMINATOR)

        assert collected == ["event-1", "event-2", "event-3", "event-4", "event-5"]
        assert _DroppingSSEHandler.last_event_ids == [None, "2", "4"]
