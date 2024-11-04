from pydantic import BaseModel
from uuid import UUID


class SubmissionIdNotFound(BaseModel):
    missing_submission_id: UUID = Field(alias="missingSubmissionId")
