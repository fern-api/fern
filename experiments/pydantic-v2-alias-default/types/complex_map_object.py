from pydantic import BaseModel
from typing import Dict
from .type import Type
from dt import datetime
from core.datetime_utils import serialize_datetime

class ComplexMapObject(BaseModel):
    """An object containing maps with wrapped alias keys."""
    simple_map: Dict[str, str]
    nested_map: Dict[str, Type]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

