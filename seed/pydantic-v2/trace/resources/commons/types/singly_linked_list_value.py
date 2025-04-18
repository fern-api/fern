from pydantic import BaseModel
from typing import Optional, Dict
from resources.commons.types.singly_linked_list_node_value import SinglyLinkedListNodeValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class SinglyLinkedListValue(BaseModel):
    head: Optional[str] = None
    nodes: Dict[str, SinglyLinkedListNodeValue]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

