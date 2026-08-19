from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from resources.commons.types.language import Language
from resources.submission.types.submission_type_state import SubmissionTypeState
from dt import datetime
from core.datetime_utils import serialize_datetime
class GetSubmissionStateResponse(BaseModel):
    time_submitted: Optional[datetime] = 
    submission: str
    language: Language
    submission_type_state: SubmissionTypeState = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

