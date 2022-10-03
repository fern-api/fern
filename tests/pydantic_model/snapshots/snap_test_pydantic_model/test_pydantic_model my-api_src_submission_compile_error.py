import pydantic


class CompileError(pydantic.BaseModel):
    message: str
