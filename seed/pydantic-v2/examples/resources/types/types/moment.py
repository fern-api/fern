from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from dt import datetime
from core.datetime_utils import serialize_datetime


class Moment(BaseModel):
    id: UUID
    date: str
    datetime: datetime

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
