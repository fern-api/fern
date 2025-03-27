from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class User(BaseModel):
    id: str
    name: str
    age: int

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
