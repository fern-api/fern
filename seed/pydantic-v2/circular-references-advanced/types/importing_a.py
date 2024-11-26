from pydantic import BaseModel
from typing import Optional
from resources.a.types.a import A
from dt import datetime
from core.datetime_utils import serialize_datetime
class ImportingA(BaseModel):
    a: Optional[A] = None
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

