from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.execution_session_status import ExecutionSessionStatus


class BuildingExecutorResponse(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    status: ExecutionSessionStatus
