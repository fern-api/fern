from pydantic import BaseModel
from typing import Dict
from dt import datetime
from core.datetime_utils import serialize_datetime


class Record(BaseModel):
    foo: Dict[str, str]
    _3_d: int

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
