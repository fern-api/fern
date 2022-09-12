import pydantic


class HttpPathPart(pydantic.BaseModel):
    path_paramter: str = pydantic.Field(alias="pathParameter")
    tail: str
