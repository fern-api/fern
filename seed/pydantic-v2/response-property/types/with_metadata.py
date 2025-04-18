from pydantic import BaseModel
from typing import Dict
from dt import datetime
from core.datetime_utils import serialize_datetime


class WithMetadata(BaseModel):
    metadata: Dict[str, str]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
