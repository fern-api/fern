import pydantic


class SubmissionId(pydantic.BaseModel):
    __root__: str
