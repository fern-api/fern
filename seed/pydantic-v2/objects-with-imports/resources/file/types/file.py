from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.file.types.file_info import FileInfo

from pydantic import BaseModel


class File(BaseModel):
    name: str
    contents: str
    info: FileInfo

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
