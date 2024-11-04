from pydantic import BaseModel
from typing import List
from resources.v_2.resources.problem.types.file_info_v_2 import FileInfoV2


class Files(BaseModel):
    files: List[FileInfoV2]
