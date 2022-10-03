import pydantic


class UserId(pydantic.BaseModel):
    __root__: str
