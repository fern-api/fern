from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import List, Set, Dict, Optional, Any
from .types.name import Name
from dt import datetime
from core.datetime_utils import serialize_datetime
class Type(BaseModel):
"""Exercises all of the built-in types."""
    one: int
    two: float
    three: str
    four: bool
    five: int
    six: datetime
    seven: str
    eight: UUID
    nine: bytes
    ten: List[int]
    eleven: Set[float]
    twelve: Dict[str, bool]
    thirteen: Optional[int] = None
    fourteen: Any
    fifteen: List[List[int]]
    sixteen: List[Dict[str, int]]
    seventeen: List[Optional[UUID]]
    eighteen: str
    nineteen: Name
    twenty: int
    twentyone: int
    twentytwo: float
    twentythree: str
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

