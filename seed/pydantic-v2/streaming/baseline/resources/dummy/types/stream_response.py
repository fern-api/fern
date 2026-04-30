from pydantic import BaseModel
from typing import Optional
from dt import datetime
from core.datetime_utils import serialize_datetime


class StreamResponse(BaseModel):
    id: str
    name: Optional[str] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
