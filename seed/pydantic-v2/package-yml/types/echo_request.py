from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime


class EchoRequest(BaseModel):
    name: str
    size: int

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
