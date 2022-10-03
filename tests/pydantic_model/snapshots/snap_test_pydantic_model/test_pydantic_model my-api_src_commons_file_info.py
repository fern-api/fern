import pydantic


class FileInfo(pydantic.BaseModel):
    filename: str
    contents: str
