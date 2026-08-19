from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime


class StuntDouble(BaseModel):
    name: str
    actor_or_actress_id: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
