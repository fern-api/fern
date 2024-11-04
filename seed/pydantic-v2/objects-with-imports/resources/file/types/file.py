from pydantic import BaseModel
from resources.file.types import FileInfo


class File(BaseModel):
    name: str
    contents: str
    info: FileInfo
