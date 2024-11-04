from pydantic import BaseModel
from typing import Optional


class BinaryTreeNodeValue(BaseModel):
    node_id: str
    val: float
    right: Optional[str] = None
    left: Optional[str] = None
