from pydantic import BaseModel


class FileInfoV2(BaseModel):
    filename: str
    directory: str
    contents: str
    editable: bool
