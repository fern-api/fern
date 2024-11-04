from pydantic import BaseModel
from uuid import UUID
from resources.submission.types import RunningSubmissionState


class RunningResponse(BaseModel):
    submission_id: UUID
    state: RunningSubmissionState
