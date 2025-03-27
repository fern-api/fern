from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class SendResponse(BaseModel):
    message: str
    status: int
    success: bool

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
