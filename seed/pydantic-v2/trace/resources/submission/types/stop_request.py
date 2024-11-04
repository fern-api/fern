from pydantic import BaseModel
from uuid import UUID


class StopRequest(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
