from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.execution_session_status import ExecutionSessionStatus
from dt import datetime
from core.datetime_utils import serialize_datetime
class BuildingExecutorResponse(BaseModel):
    submission_id: UUID = 
    status: ExecutionSessionStatus
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

