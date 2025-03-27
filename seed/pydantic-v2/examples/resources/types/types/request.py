from typing import Any

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Request(BaseModel):
    request: Any

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
