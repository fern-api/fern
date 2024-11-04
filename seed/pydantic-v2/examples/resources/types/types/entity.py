from pydantic import BaseModel
from types import Type


class Entity(BaseModel):
    type: Type
    name: str
