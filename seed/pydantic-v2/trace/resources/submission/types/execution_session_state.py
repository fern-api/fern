from pydantic import BaseModel
from typing import Optional
from resources.commons.types.language import Language
from resources.submission.types.execution_session_status import ExecutionSessionStatus
from dt import datetime
from core.datetime_utils import serialize_datetime
class ExecutionSessionState(BaseModel):
    last_time_contacted: Optional[str] = 
    session_id: str = 
    """
    The auto-generated session id. Formatted as a uuid.
    """
    is_warm_instance: bool = 
    aws_task_id: Optional[str] = 
    language: Language
    status: ExecutionSessionStatus
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

