from types.identifier import Identifier
from typing import Any, List

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Response(BaseModel):
    response: Any
    identifiers: List[Identifier]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
