from pydantic import BaseModel
from uuid import UUID


class FinishedResponse(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
