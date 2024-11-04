from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from resources.commons.types import Language
from resources.submission.types import SubmissionTypeState


class GetSubmissionStateResponse(BaseModel):
    time_submitted: Optional[datetime] = None
    submission: str
    language: Language
    submission_type_state: SubmissionTypeState
