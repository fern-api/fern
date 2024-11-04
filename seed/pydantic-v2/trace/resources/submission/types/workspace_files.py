from pydantic import BaseModel
from resources.commons.types import FileInfo
from typing import List


class WorkspaceFiles(BaseModel):
    main_file: FileInfo
    read_only_files: List[FileInfo]
