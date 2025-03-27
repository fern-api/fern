from typing import Dict

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class ObjectWithMapOfMap(BaseModel):
    map_: Dict[str, Dict[str, str]]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
