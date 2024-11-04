from pydantic import BaseModel
from .types import Shape


class Type(BaseModel):
    decimal: float
    even: int
    name: str
    shape: Shape
