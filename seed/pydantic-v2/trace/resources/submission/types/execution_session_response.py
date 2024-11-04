from pydantic import BaseModel
from typing import Optional
from resources.commons.types.language import Language
from resources.submission.types.execution_session_status import ExecutionSessionStatus


class ExecutionSessionResponse(BaseModel):
    session_id: str = Field(alias="sessionId")
    execution_session_url: Optional[str] = Field(
        alias="executionSessionUrl", default=None
    )
    language: Language
    status: ExecutionSessionStatus
