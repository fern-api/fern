import pydantic


class NodeId(pydantic.BaseModel):
    __root__: str
