from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime
class ExceptionInfo(BaseModel):
    exception_type: str = 
    exception_message: str = 
    exception_stacktrace: str = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

