from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.error_info import ErrorInfo
from dt import datetime
from core.datetime_utils import serialize_datetime
class ErroredResponse(BaseModel):
    submission_id: UUID = 
    error_info: ErrorInfo = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

