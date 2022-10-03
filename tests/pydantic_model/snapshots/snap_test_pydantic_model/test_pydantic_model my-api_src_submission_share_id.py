import pydantic


class ShareId(pydantic.BaseModel):
    __root__: str
