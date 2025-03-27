from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.v_2.resources.problem.types.file_info_v_2 import FileInfoV2

from pydantic import BaseModel


class Files(BaseModel):
    files: List[FileInfoV2]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
