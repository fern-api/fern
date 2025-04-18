from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from dt import datetime
from core.datetime_utils import serialize_datetime
class RecordedResponseNotification(BaseModel):
    submission_id: UUID = 
    trace_responses_size: int = 
    test_case_id: Optional[str] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

