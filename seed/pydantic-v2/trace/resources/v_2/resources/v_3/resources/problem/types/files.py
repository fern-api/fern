from pydantic import BaseModel
from typing import List
from resources.v_2.resources.v_3.resources.problem.types import FileInfoV2


class Files(BaseModel):
    files: List[FileInfoV2]
