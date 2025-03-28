from typing import List, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.types.types.directory import Directory
from resources.types.types.file import File

from pydantic import BaseModel


class Directory(BaseModel):
    name: str
    files: Optional[List[File]] = None
    directories: Optional[List[Directory]] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
