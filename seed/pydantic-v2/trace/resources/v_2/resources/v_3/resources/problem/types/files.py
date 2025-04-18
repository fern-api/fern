from pydantic import BaseModel
from typing import List
from resources.v_2.resources.v_3.resources.problem.types.file_info_v_2 import FileInfoV2
from dt import datetime
from core.datetime_utils import serialize_datetime
class Files(BaseModel):
    files: List[FileInfoV2]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

