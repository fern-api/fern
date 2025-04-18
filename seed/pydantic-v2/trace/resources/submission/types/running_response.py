from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.running_submission_state import RunningSubmissionState
from dt import datetime
from core.datetime_utils import serialize_datetime
class RunningResponse(BaseModel):
    submission_id: UUID = 
    state: RunningSubmissionState
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

