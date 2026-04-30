from pydantic import BaseModel
from resources.submission.types.exception_info import ExceptionInfo
from dt import datetime
from core.datetime_utils import serialize_datetime
class InternalError(BaseModel):
    exception_info: ExceptionInfo = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

