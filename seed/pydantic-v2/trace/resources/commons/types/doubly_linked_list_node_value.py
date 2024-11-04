from pydantic import BaseModel
from typing import Optional


class DoublyLinkedListNodeValue(BaseModel):
    node_id: str
    val: float
    next: Optional[str] = None
    prev: Optional[str] = None
