from pydantic import BaseModel
from typing import Dict, Optional, List
from resources.submission.types import ExecutionSessionState


class GetExecutionSessionStateResponse(BaseModel):
    states: Dict[str, ExecutionSessionState]
    num_warming_instances: Optional[int] = None
    warming_session_ids: List[str]
