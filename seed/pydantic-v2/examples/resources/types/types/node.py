from pydantic import BaseModel
from typing import Optional, List
from resources.types.types.node import Node
from resources.types.types.tree import Tree


class Node(BaseModel):
    name: str
    nodes: Optional[List[Node]] = None
    trees: Optional[List[Tree]] = None
