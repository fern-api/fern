import pydantic
from .http_path_part import HttpPathPart
import typing


class HttpPath(pydantic.BaseModel):
    head: str
    parts: typing.List[HttpPathPart]
