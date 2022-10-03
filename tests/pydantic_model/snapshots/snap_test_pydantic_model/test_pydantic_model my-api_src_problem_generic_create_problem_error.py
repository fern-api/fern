import pydantic


class GenericCreateProblemError(pydantic.BaseModel):
    message: str
    type: str
    stacktrace: str
