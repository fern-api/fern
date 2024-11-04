from pydantic import BaseModel
from typing import Optional, List
from .types import Node


class Tree(BaseModel):
    nodes: Optional[List[Node]] = None
