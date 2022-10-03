import pydantic


class SubmissionFileInfo(pydantic.BaseModel):
    directory: str
    filename: str
    contents: str
