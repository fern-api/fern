from pydantic import BaseModel
from typing import Optional
from resources.submission.types.exception_v_2 import ExceptionV2
from resources.submission.types.exception_info import ExceptionInfo
from dt import datetime
from core.datetime_utils import serialize_datetime
class WorkspaceRunDetails(BaseModel):
    exception_v_2: Optional[ExceptionV2] = 
    exception: Optional[ExceptionInfo] = None
    stdout: str
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

