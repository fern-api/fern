from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.running_submission_state import RunningSubmissionState


class RunningResponse(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    state: RunningSubmissionState
