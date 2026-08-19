from pydantic import BaseModel
from typing import Optional, Dict
from dt import datetime
from core.datetime_utils import serialize_datetime


class Metadata(BaseModel):
    id: str
    data: Optional[Dict[str, str]] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
