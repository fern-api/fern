from pydantic import BaseModel
from typing import Optional


class SinglyLinkedListNodeValue(BaseModel):
    node_id: str = Field(alias="nodeId")
    val: float
    next: Optional[str] = None
