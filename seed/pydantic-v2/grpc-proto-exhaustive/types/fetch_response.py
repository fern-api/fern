from pydantic import BaseModel
from typing import Optional, Dict
from .types.column import Column
from .types.usage import Usage
from dt import datetime
from core.datetime_utils import serialize_datetime


class FetchResponse(BaseModel):
    columns: Optional[Dict[str, Column]] = None
    namespace: Optional[str] = None
    usage: Optional[Usage] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
