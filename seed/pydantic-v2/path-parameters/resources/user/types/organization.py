from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Organization(BaseModel):
    name: str
    tags: List[str]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
