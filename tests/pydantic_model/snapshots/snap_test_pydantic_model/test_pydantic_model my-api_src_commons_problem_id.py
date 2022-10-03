import pydantic


class ProblemId(pydantic.BaseModel):
    __root__: str
