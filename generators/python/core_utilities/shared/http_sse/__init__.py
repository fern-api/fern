from ._api import (
    DEFAULT_MAX_RECONNECTION_ATTEMPTS,
    DEFAULT_RECONNECT_DELAY_MS,
    MAX_LINE_SIZE,
    MAX_RECONNECT_DELAY_MS,
    EventSource,
    aconnect_sse,
    connect_sse,
)
from ._exceptions import SSEError
from ._models import ServerSentEvent

__version__ = "0.4.1"

__all__ = [
    "__version__",
    "MAX_LINE_SIZE",
    "DEFAULT_MAX_RECONNECTION_ATTEMPTS",
    "DEFAULT_RECONNECT_DELAY_MS",
    "MAX_RECONNECT_DELAY_MS",
    "EventSource",
    "connect_sse",
    "aconnect_sse",
    "ServerSentEvent",
    "SSEError",
]
