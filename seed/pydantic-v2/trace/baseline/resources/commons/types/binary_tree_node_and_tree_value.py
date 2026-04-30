from pydantic import BaseModel
from resources.commons.types.binary_tree_value import BinaryTreeValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class BinaryTreeNodeAndTreeValue(BaseModel):
    node_id: str = 
    full_tree: BinaryTreeValue = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

