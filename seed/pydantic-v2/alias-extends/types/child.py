from .types.parent import Parent
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Child(BaseModel, Parent):
    child: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
