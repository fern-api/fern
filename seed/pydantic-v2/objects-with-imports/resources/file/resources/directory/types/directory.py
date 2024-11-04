from pydantic import BaseModel
from typing import Optional, List
from resources.file.types.file import File
from resources.file.resources.directory.types.directory import Directory


class Directory(BaseModel):
    name: str
    files: Optional[List[File]] = None
    directories: Optional[List[Directory]] = None
