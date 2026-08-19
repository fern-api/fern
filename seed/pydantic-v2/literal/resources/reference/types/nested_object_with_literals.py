from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime


class NestedObjectWithLiterals(BaseModel):
    literal_1: str
    literal_2: str
    str_prop: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
