from pydantic import BaseModel
from typing import Optional


class DoublyLinkedListNodeValue(BaseModel):
    node_id: str = Field(alias="nodeId")
    val: float
    next: Optional[str] = None
    prev: Optional[str] = None
