from pydantic import BaseModel


class TracedFile(BaseModel):
    filename: str
    directory: str
