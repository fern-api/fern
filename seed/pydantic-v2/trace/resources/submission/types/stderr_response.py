from pydantic import BaseModel
from uuid import UUID


class StderrResponse(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    stderr: str
