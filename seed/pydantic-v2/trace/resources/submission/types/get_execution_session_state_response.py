from pydantic import BaseModel
from typing import Dict, Optional, List
from resources.submission.types.execution_session_state import ExecutionSessionState
from dt import datetime
from core.datetime_utils import serialize_datetime
class GetExecutionSessionStateResponse(BaseModel):
    states: Dict[str, ExecutionSessionState]
    num_warming_instances: Optional[int] = 
    warming_session_ids: List[str] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

