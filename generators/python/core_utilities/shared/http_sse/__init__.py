from ._api import EventSource
from ._exceptions import SSEError
from ._models import ServerSentEvent

__version__ = "0.4.1"

__all__ = [
    "__version__",
    "EventSource",
    "ServerSentEvent",
    "SSEError",
]
