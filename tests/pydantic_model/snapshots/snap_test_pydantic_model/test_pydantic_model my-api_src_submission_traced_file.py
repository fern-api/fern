import pydantic


class TracedFile(pydantic.BaseModel):
    filename: str
    directory: str
