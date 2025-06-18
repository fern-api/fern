from pydantic import BaseModel
from typing import Dict, Any
from dt import datetime
from core.datetime_utils import serialize_datetime

class NamedMetadata(BaseModel):
    name: str
    value: Dict[str, Any]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

