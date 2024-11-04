from pydantic import BaseModel


class File(BaseModel):
    name: str
    contents: str
