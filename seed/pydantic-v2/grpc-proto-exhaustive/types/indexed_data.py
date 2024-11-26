from pydantic import BaseModel
from typing import List
from dt import datetime
from core.datetime_utils import serialize_datetime


class IndexedData(BaseModel):
    indices: List[int]
    values: List[float]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
