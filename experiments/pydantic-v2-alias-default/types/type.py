from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime

class Type(BaseModel):
    """A simple type with just a name."""
    id: str
    name: str
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

