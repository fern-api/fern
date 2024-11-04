from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from resources.commons.types.language import Language
from resources.submission.types.submission_type_state import SubmissionTypeState


class GetSubmissionStateResponse(BaseModel):
    time_submitted: Optional[datetime] = Field(alias="timeSubmitted", default=None)
    submission: str
    language: Language
    submission_type_state: SubmissionTypeState = Field(alias="submissionTypeState")
