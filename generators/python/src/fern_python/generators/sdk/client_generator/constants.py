from typing import Final

# Variable name used for targets when iterating over streaming or file download responses.
CHUNK_VARIABLE: Final[str] = "_chunk"

DEFAULT_BODY_PARAMETER_VALUE = "OMIT"

RESPONSE_VARIABLE: Final[str] = "_response"

# Name of the closure generated for resumable SSE endpoints that re-issues the
# original request (with a ``Last-Event-ID`` header) so ``EventSource`` can
# transparently reconnect a dropped stream.
SSE_RECONNECT_VARIABLE: Final[str] = "_reconnect"
