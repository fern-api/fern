from pydantic import BaseModel
from .types.parent import Parent
from dt import datetime
from core.datetime_utils import serialize_datetime


class Child(BaseModel, Parent):
    child: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
