from pydantic import BaseModel
from typing import Optional, List
from resources.submission.types.trace_response_v_2 import TraceResponseV2
from dt import datetime
from core.datetime_utils import serialize_datetime
class TraceResponsesPageV2(BaseModel):
    offset: Optional[int] = None
    """
    If present, use this to load subsequent pages.
    The offset is the id of the next trace response to load.
    """
    trace_responses: List[TraceResponseV2] =
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

