from pydantic import BaseModel
from typing import Optional, List
from resources.submission.types.trace_response import TraceResponse


class TraceResponsesPage(BaseModel):
    offset: Optional[int] = None
    """
    If present, use this to load subseqent pages.
    The offset is the id of the next trace response to load.
    """
    trace_responses: List[TraceResponse] = Field(alias="traceResponses")
