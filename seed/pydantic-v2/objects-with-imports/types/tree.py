from pydantic import BaseModel
from typing import Optional, List
from .node import Node


class Tree(BaseModel):
    nodes: Optional[List[Node]] = None
