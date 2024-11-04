from pydantic import BaseModel
from typing import Optional, Dict
from resources.commons.types.binary_tree_node_value import BinaryTreeNodeValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class BinaryTreeValue(BaseModel):
    root: Optional[str] = None
    nodes: Dict[str, BinaryTreeNodeValue]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

