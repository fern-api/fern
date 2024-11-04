from pydantic import BaseModel
from uuid import UUID
from resources.submission.types import ExecutionSessionStatus


class BuildingExecutorResponse(BaseModel):
    submission_id: UUID
    status: ExecutionSessionStatus
