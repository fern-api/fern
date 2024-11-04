from pydantic import BaseModel


class SubmissionFileInfo(BaseModel):
    directory: str
    filename: str
    contents: str
