from pydantic import BaseModel
from types.type import Type


class Entity(BaseModel):
    type: Type
    name: str
