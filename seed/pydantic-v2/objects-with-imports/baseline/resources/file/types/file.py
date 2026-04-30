from pydantic import BaseModel
from resources.file.types.file_info import FileInfo
from dt import datetime
from core.datetime_utils import serialize_datetime


class File(BaseModel):
    name: str
    contents: str
    info: FileInfo

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
