from pydantic import BaseModel
from typing import Any, List
from types.identifier import Identifier
from dt import datetime
from core.datetime_utils import serialize_datetime


class Response(BaseModel):
    response: Any
    identifiers: List[Identifier]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
