from pydantic import BaseModel
from .error_category import ErrorCategory
from .error_code import ErrorCode
from typing import Optional
from dt import datetime
from core.datetime_utils import serialize_datetime

class Error(BaseModel):
    category: ErrorCategory
    code: ErrorCode
    detail: Optional[str] = None
    field: Optional[str] = None
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

