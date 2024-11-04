from pydantic import BaseModel
from typing import Optional, List
from resources.submission.types import TraceResponse


class TraceResponsesPage(BaseModel):
    offset: Optional[int] = None
    trace_responses: List[TraceResponse]
