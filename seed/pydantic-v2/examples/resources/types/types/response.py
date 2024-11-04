from pydantic import BaseModel
from typing import Any, List
from types.identifier import Identifier


class Response(BaseModel):
    response: Any
    identifiers: List[Identifier]
