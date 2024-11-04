from pydantic import BaseModel
from uuid import UUID


class ExistingSubmissionExecuting(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
