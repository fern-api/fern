from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime
class FileInfoV2(BaseModel):
    filename: str
    directory: str
    contents: str
    editable: bool
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

