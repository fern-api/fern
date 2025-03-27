from typing import Dict, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.types.singly_linked_list_node_value import SinglyLinkedListNodeValue

from pydantic import BaseModel


class SinglyLinkedListValue(BaseModel):
    head: Optional[str] = None
    nodes: Dict[str, SinglyLinkedListNodeValue]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
