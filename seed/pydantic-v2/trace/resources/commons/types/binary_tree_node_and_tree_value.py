from pydantic import BaseModel
from resources.commons.types.binary_tree_value import BinaryTreeValue


class BinaryTreeNodeAndTreeValue(BaseModel):
    node_id: str = Field(alias="nodeId")
    full_tree: BinaryTreeValue = Field(alias="fullTree")
