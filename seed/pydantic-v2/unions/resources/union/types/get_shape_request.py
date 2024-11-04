from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime


class GetShapeRequest(BaseModel):
    id: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
