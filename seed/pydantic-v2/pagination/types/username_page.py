from pydantic import BaseModel
from typing import Optional, List
from dt import datetime
from core.datetime_utils import serialize_datetime


class UsernamePage(BaseModel):
    after: Optional[str] = None
    data: List[str]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
