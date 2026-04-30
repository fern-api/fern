from pydantic import BaseModel
from resources.commons.types.singly_linked_list_value import SinglyLinkedListValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class SinglyLinkedListNodeAndListValue(BaseModel):
    node_id: str = 
    full_list: SinglyLinkedListValue = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

