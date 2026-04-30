from pydantic import BaseModel
from typing import Optional
from resources.union.types.my_union import MyUnion
from dt import datetime
from core.datetime_utils import serialize_datetime
class TypeWithOptionalUnion(BaseModel):
    my_union: Optional[MyUnion] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

