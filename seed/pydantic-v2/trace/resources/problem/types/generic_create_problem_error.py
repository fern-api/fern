from pydantic import BaseModel


class GenericCreateProblemError(BaseModel):
    message: str
    type: str
    stacktrace: str
