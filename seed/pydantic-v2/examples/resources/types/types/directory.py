from pydantic import BaseModel
from typing import Optional, List
from resources.types.types import File, Directory


class Directory(BaseModel):
    name: str
    files: Optional[List[File]] = None
    directories: Optional[List[Directory]] = None
