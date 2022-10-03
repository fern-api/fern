import pydantic


class RuntimeError(pydantic.BaseModel):
    message: str
