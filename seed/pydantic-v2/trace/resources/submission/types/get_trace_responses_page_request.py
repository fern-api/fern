from typing import Optional

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class GetTraceResponsesPageRequest(BaseModel):
    offset: Optional[int] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
