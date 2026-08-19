from pydantic import BaseModel
from types.type import Type
from dt import datetime
from core.datetime_utils import serialize_datetime


class ResponseType(BaseModel):
    type: Type

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
