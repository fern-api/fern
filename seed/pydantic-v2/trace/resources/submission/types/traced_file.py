from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime
class TracedFile(BaseModel):
    filename: str
    directory: str
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

