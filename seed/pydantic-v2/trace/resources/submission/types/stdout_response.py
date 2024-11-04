from pydantic import BaseModel
from uuid import UUID


class StdoutResponse(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    stdout: str
