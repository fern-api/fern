from pydantic import BaseModel
from typing import List
from resources.reference.types.nested_object_with_literals import (
    NestedObjectWithLiterals,
)
from dt import datetime
from core.datetime_utils import serialize_datetime


class ContainerObject(BaseModel):
    nested_objects: List[NestedObjectWithLiterals]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
