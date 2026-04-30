from pydantic import BaseModel
from .types.json import Json
from dt import datetime
from core.datetime_utils import serialize_datetime


class NestedType(BaseModel, Json):
    name: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
