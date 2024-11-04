from pydantic import BaseModel
from .types.shape import Shape

"""Defines properties with default values and validation rules."""


class Type(BaseModel):
    decimal: float
    even: int
    name: str
    shape: Shape
