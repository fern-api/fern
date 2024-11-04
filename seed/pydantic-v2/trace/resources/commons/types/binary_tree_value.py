from pydantic import BaseModel
from typing import Optional, Dict
from resources.commons.types.binary_tree_node_value import BinaryTreeNodeValue


class BinaryTreeValue(BaseModel):
    root: Optional[str] = None
    nodes: Dict[str, BinaryTreeNodeValue]
