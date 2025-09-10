from pydantic import BaseModel
from typing import Optional, List
from .error import Error
from dt import datetime
from core.datetime_utils import serialize_datetime

class PutResponse(BaseModel):
    errors: Optional[List[Error]] = None
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

