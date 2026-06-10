from pydantic import BaseModel
from .foo import Foo
from dt import datetime
from core.datetime_utils import serialize_datetime


class FooExtended(BaseModel, Foo):
    age: int

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
