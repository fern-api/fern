from pydantic import BaseModel
from typing import Dict, Optional, List
from resources.submission.types.execution_session_state import ExecutionSessionState


class GetExecutionSessionStateResponse(BaseModel):
    states: Dict[str, ExecutionSessionState]
    num_warming_instances: Optional[int] = Field(
        alias="numWarmingInstances", default=None
    )
    warming_session_ids: List[str] = Field(alias="warmingSessionIds")
