from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class FileInfoV2(BaseModel):
    filename: str
    directory: str
    contents: str
    editable: bool

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
