import json
from typing import AsyncIterator
from unittest.mock import AsyncMock, Mock

import httpx
import pytest

from core_utilities.shared.http_sse import (
    EventSource,
    ServerSentEvent,
    SSEError,
)


class TestSSEDecoder:
    """Test cases for SSEDecoder with edge cases and complex scenarios."""

    def test_basic_sse_event(self) -> None:
        """Test basic SSE event decoding."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = ["event: test", "data: hello world", "id: 123", "retry: 5000", ""]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello world"
        assert events[0].id == "123"
        assert events[0].retry == 5000

    def test_multiple_sse_events_without_final_double_newline(self) -> None:
        """Test multiple SSE events where the final one doesn't end with double newline."""
        # iter_lines yields lines without newline terminators.
        # An empty string represents the blank line that separates events.
        # The third event never gets a blank-line separator, so it stays incomplete.
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: first", "data: first data", "",
            "event: second", "data: second data", "",
            "event: third", "data: third data",
        ]

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
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: multiline",
            "data: line1\\nline2",
            "data: \\n\\n",
            "data: line3\\n",
            "",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "multiline"
        # Should preserve the literal \n characters in the data
        assert events[0].data == "line1\\nline2\n\\n\\n\nline3\\n"

    def test_sse_event_with_complex_escaped_content(self) -> None:
        """Test SSE event with complex escaped content including newlines."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: complex",
            "data: This is line 1",
            "data: This is line 2",
            "data: ",
            "data: This is line 3",
            "data: Special chars: \\n \\r \\t",
            "",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "complex"
        # Should have actual newlines from multiple data lines AND preserve literal \n characters
        expected_data = "This is line 1\nThis is line 2\n\nThis is line 3\nSpecial chars: \\n \\r \\t"
        assert events[0].data == expected_data

    def test_sse_event_with_null_character_in_id(self) -> None:
        """Test SSE event with null character in id field (should be ignored)."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: test", "data: test data", "id: normal_id", "id: id_with_null\0character", "",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].id == "normal_id"  # Should keep the previous valid id

    def test_sse_event_with_invalid_retry(self) -> None:
        """Test SSE event with invalid retry value."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: test", "data: test data", "retry: 5000", "retry: invalid", "",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].retry == 5000  # Should keep the previous valid retry

    def test_sse_event_with_comment_line(self) -> None:
        """Test SSE event with comment line (starts with colon)."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: test", "data: test data", ": this is a comment", "data: more data", "",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].data == "test data\nmore data"

    def test_sse_event_with_field_name_space(self) -> None:
        """Test SSE event with field name followed by space."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: test", "data: test data", "data : spaced field", "",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        # The decoder treats "data :" as a different field name, so it's ignored
        assert events[0].data == "test data"

    def test_sse_event_with_unknown_field(self) -> None:
        """Test SSE event with unknown field (should be ignored)."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: test", "data: test data", "unknown: ignored", "",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "test data"

    def test_empty_sse_event(self) -> None:
        """Test empty SSE event (no fields)."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [""]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 0

    def test_sse_event_with_only_data(self) -> None:
        """Test SSE event with only data field (default event type)."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = ["data: hello", ""]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == ""  # No event field set, so empty string
        assert events[0].data == "hello"

    def test_multiple_data_lines(self) -> None:
        """Test SSE event with multiple data lines."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = ["data: line1", "data: line2", "data: line3", ""]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].data == "line1\nline2\nline3"

    def test_sse_event_with_retry_only(self) -> None:
        """Test SSE event with only retry field."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = ["retry: 3000", ""]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].retry == 3000
        assert events[0].event == ""  # No event field set, so empty string
        assert events[0].data == ""  # Empty data

    def test_sse_event_preserves_last_event_id(self) -> None:
        """Test that last event id is preserved across events."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "id: first_id", "data: first data", "", "data: second data", "",
        ]

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
        with pytest.raises(SSEError, match="Expected Content-Type 'text/event-stream'"):
            event_source._check_content_type()

    def test_content_type_with_charset(self) -> None:
        """Test content type with charset parameter."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream; charset=utf-8"}
        event_source = EventSource(response)

        # Should not raise exception
        event_source._check_content_type()

    def test_iter_sse_basic(self) -> None:
        """Test basic SSE iteration."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = ["event: test", "data: hello", "data: world", ""]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello\nworld"

    def test_iter_sse_multiple_events(self) -> None:
        """Test SSE iteration with multiple events."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: first",
            "data: first data",
            "",
            "event: second",
            "data: second data",
            "",
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
        response.iter_lines.return_value = [
            "event: test",
            "data: hello",
            "data: world",
            "",
            "asdlkjfa;skdjf",  # Extra line that shouldn't form a complete event
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert events[0].data == "hello\nworld"

    def test_iter_sse_with_special_characters(self) -> None:
        """Test SSE iteration with special characters in data."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}
        response.iter_lines.return_value = [
            "event: test",
            "data: hello\u00e9world",  # Unicode character
            "",
        ]

        event_source = EventSource(response)
        events = list(event_source.iter_sse())

        assert len(events) == 1
        assert events[0].event == "test"
        assert "hello" in events[0].data

    @pytest.mark.asyncio
    async def test_aiter_sse_basic(self) -> None:
        """Test basic async SSE iteration."""
        response = Mock()
        response.headers = {"content-type": "text/event-stream"}

        # Mock aiter_lines to return the SSE data as lines
        async def mock_aiter_lines() -> AsyncIterator[str]:
            yield "event: test"
            yield "data: hello"
            yield "data: world"
            yield ""  # Empty line triggers event

        response.aiter_lines = mock_aiter_lines

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

        # Mock aiter_lines to return the SSE data as lines
        async def mock_aiter_lines() -> AsyncIterator[str]:
            yield "event: first"
            yield "data: first data"
            yield ""
            yield "event: second"
            yield "data: second data"
            yield ""

        response.aiter_lines = mock_aiter_lines

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

        # Mock aiter_lines to return the SSE data as lines
        async def mock_aiter_lines() -> AsyncIterator[str]:
            yield "data: test"
            yield ""

        response.aiter_lines = mock_aiter_lines

        event_source = EventSource(response)

        # Should process events correctly
        events = []
        async for event in event_source.aiter_sse():
            events.append(event)

        assert len(events) == 1
        assert events[0].data == "test"


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
