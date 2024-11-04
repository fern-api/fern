from pydantic import BaseModel
from .types.type import Type


class Identifier(BaseModel):
    type: Type
    value: str
    label: str
