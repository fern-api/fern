from pydantic import BaseModel
from resources.commons.types.file_info import FileInfo
from typing import List
from dt import datetime
from core.datetime_utils import serialize_datetime
class ProblemFiles(BaseModel):
    solution_file: FileInfo = 
    read_only_files: List[FileInfo] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

