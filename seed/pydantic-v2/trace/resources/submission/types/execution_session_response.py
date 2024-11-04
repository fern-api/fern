from pydantic import BaseModel
from typing import Optional
from resources.commons.types import Language
from resources.submission.types import ExecutionSessionStatus


class ExecutionSessionResponse(BaseModel):
    session_id: str
    execution_session_url: Optional[str] = None
    language: Language
    status: ExecutionSessionStatus
