from pydantic import BaseModel
from .types import Type


class Identifier(BaseModel):
    type: Type
    value: str
    label: str
