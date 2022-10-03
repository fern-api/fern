import pydantic


class ParameterId(pydantic.BaseModel):
    __root__: str
