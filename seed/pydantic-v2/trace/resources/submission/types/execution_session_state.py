from pydantic import BaseModel
from typing import Optional
from resources.commons.types import Language
from resources.submission.types import ExecutionSessionStatus


class ExecutionSessionState(BaseModel):
    last_time_contacted: Optional[str] = None
    session_id: str
    is_warm_instance: bool
    aws_task_id: Optional[str] = None
    language: Language
    status: ExecutionSessionStatus
