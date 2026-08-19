from pydantic import BaseModel
from .types.shape import Shape
from dt import datetime
from core.datetime_utils import serialize_datetime
class Type(BaseModel):
"""Defines properties with default values and validation rules."""
    decimal: float
    even: int
    name: str
    shape: Shape
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

