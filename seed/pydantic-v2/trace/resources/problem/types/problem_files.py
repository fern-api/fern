from pydantic import BaseModel
from resources.commons.types.file_info import FileInfo
from typing import List


class ProblemFiles(BaseModel):
    solution_file: FileInfo = Field(alias="solutionFile")
    read_only_files: List[FileInfo] = Field(alias="readOnlyFiles")
