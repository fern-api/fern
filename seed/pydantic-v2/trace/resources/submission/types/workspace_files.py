from pydantic import BaseModel
from resources.commons.types.file_info import FileInfo
from typing import List


class WorkspaceFiles(BaseModel):
    main_file: FileInfo = Field(alias="mainFile")
    read_only_files: List[FileInfo] = Field(alias="readOnlyFiles")
