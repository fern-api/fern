from pydantic import BaseModel
from typing import Optional, List
from resources.submission.types.trace_response import TraceResponse
from dt import datetime
from core.datetime_utils import serialize_datetime
class TraceResponsesPage(BaseModel):
    offset: Optional[int] = None
    """
    If present, use this to load subsequent pages.
    The offset is the id of the next trace response to load.
    """
    trace_responses: List[TraceResponse] =
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

