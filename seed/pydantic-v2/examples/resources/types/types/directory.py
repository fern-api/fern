from pydantic import BaseModel
from typing import Optional, List
from resources.types.types.file import File
from resources.types.types.directory import Directory
from dt import datetime
from core.datetime_utils import serialize_datetime


class Directory(BaseModel):
    name: str
    files: Optional[List[File]] = None
    directories: Optional[List[Directory]] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
