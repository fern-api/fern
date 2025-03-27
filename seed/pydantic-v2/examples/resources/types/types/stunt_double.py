from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class StuntDouble(BaseModel):
    name: str
    actor_or_actress_id: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
