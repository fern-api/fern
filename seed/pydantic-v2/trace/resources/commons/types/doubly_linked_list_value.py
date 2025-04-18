from pydantic import BaseModel
from typing import Optional, Dict
from resources.commons.types.doubly_linked_list_node_value import DoublyLinkedListNodeValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class DoublyLinkedListValue(BaseModel):
    head: Optional[str] = None
    nodes: Dict[str, DoublyLinkedListNodeValue]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

