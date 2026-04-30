from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCaseMetadata(BaseModel):
    id: str
    name: str
    hidden: bool
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

