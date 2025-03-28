from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class TerminatedResponse(BaseModel):
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
