from pydantic import BaseModel
from typing import List
from resources.commons.types.debug_key_value_pairs import DebugKeyValuePairs
from dt import datetime
from core.datetime_utils import serialize_datetime
class DebugMapValue(BaseModel):
    key_value_pairs: List[DebugKeyValuePairs] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

