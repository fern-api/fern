from pydantic import BaseModel
from typing import List
from resources.commons.types.key_value_pair import KeyValuePair
from dt import datetime
from core.datetime_utils import serialize_datetime
class MapValue(BaseModel):
    key_value_pairs: List[KeyValuePair] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

