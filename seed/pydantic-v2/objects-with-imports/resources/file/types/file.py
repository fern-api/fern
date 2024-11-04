from pydantic import BaseModel
from resources.file.types.file_info import FileInfo


class File(BaseModel):
    name: str
    contents: str
    info: FileInfo
