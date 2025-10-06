from dataclasses import dataclass
import json
from typing import Any, Optional


@dataclass(frozen=True)
class ServerSentEvent:
    event: str = "message"
    data: str = ""
    id: str = ""
    retry: Optional[int] = None

    def json(self) -> Any:
        """Parse the data field as JSON."""
        return json.loads(self.data)
