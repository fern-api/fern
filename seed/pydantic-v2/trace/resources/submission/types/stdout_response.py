from pydantic import BaseModel
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime
class StdoutResponse(BaseModel):
    submission_id: UUID = 
    stdout: str
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

