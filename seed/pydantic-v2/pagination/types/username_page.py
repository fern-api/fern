from typing import List, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class UsernamePage(BaseModel):
    after: Optional[str] = None
    data: List[str]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
