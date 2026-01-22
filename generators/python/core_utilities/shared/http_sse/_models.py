import json
from dataclasses import dataclass
from typing import Any, Optional, Sequence


@dataclass(frozen=True)
class ServerSentEvent:
    event: str = "message"
    data: str = ""
    id: str = ""
    retry: Optional[int] = None

    def json(self) -> Any:
        """Parse the data field as JSON."""
        return json.loads(self.data)


def parse_sse_event(data: Any, fields_to_parse: Sequence[str] = ()) -> Any:
    """
    Parse JSON strings for specified fields in SSE event data.

    When SSE events contain nested objects that arrive as JSON strings,
    this function parses those string fields into Python objects.

    Args:
        data: The parsed SSE event data (typically from ServerSentEvent.json())
        fields_to_parse: Field names that should be parsed from JSON strings to objects

    Returns:
        The data with specified fields parsed from JSON strings
    """
    if not isinstance(data, dict) or not fields_to_parse:
        return data

    result = dict(data)
    for field in fields_to_parse:
        if field in result and isinstance(result[field], str):
            try:
                result[field] = json.loads(result[field])
            except (json.JSONDecodeError, ValueError):
                pass
    return result
