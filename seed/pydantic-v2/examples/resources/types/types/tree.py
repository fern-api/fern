from pydantic import BaseModel
from typing import Optional, List
from resources.types.types import Node


class Tree(BaseModel):
    nodes: Optional[List[Node]] = None
