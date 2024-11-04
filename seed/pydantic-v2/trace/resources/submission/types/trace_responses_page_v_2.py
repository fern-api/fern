from pydantic import BaseModel
from typing import Optional, List
from resources.submission.types.trace_response_v_2 import TraceResponseV2


class TraceResponsesPageV2(BaseModel):
    offset: Optional[int] = None
    """
    If present, use this to load subseqent pages.
    The offset is the id of the next trace response to load.
    """
    trace_responses: List[TraceResponseV2] = Field(alias="traceResponses")
