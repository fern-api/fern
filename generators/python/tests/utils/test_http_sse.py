import json
from typing import AsyncIterator
from unittest.mock import AsyncMock, Mock

import httpx
import pytest

from core_utilities.shared.http_sse import (
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
