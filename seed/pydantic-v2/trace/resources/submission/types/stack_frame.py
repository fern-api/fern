from pydantic import BaseModel
from typing import List
from resources.submission.types.scope import Scope
from dt import datetime
from core.datetime_utils import serialize_datetime
class StackFrame(BaseModel):
    method_name: str = 
    line_number: int = 
    scopes: List[Scope]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

