from pydantic import BaseModel
from uuid import UUID


class StoppedResponse(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
