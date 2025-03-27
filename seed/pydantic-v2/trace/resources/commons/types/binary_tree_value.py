from typing import Dict, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.types.binary_tree_node_value import BinaryTreeNodeValue

from pydantic import BaseModel


class BinaryTreeValue(BaseModel):
    root: Optional[str] = None
    nodes: Dict[str, BinaryTreeNodeValue]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
