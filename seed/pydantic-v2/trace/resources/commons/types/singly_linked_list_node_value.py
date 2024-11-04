from pydantic import BaseModel
from typing import Optional


class SinglyLinkedListNodeValue(BaseModel):
    node_id: str
    val: float
    next: Optional[str] = None
