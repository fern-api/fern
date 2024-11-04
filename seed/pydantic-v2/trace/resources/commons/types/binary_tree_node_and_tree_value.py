from pydantic import BaseModel
from resources.commons.types import BinaryTreeValue


class BinaryTreeNodeAndTreeValue(BaseModel):
    node_id: str
    full_tree: BinaryTreeValue
