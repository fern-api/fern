from pydantic import BaseModel
from typing import Optional, List
from resources.types.types.file import File
from resources.types.types.directory import Directory


class Directory(BaseModel):
    name: str
    files: Optional[List[File]] = None
    directories: Optional[List[Directory]] = None
