from pydantic import BaseModel
from resources.commons.types.doubly_linked_list_value import DoublyLinkedListValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class DoublyLinkedListNodeAndListValue(BaseModel):
    node_id: str = 
    full_list: DoublyLinkedListValue = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

