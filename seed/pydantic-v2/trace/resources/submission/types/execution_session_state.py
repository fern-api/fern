from pydantic import BaseModel
from typing import Optional
from resources.commons.types.language import Language
from resources.submission.types.execution_session_status import ExecutionSessionStatus


class ExecutionSessionState(BaseModel):
    last_time_contacted: Optional[str] = Field(alias="lastTimeContacted", default=None)
    session_id: str = Field(alias="sessionId")
    """
    The auto-generated session id. Formatted as a uuid.
    """
    is_warm_instance: bool = Field(alias="isWarmInstance")
    aws_task_id: Optional[str] = Field(alias="awsTaskId", default=None)
    language: Language
    status: ExecutionSessionStatus
