from pydantic import BaseModel
from typing import Optional, List
from resources.submission.types import TraceResponseV2


class TraceResponsesPageV2(BaseModel):
    offset: Optional[int] = None
    trace_responses: List[TraceResponseV2]
