from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.reference.types.nested_object_with_literals import (
    NestedObjectWithLiterals,
)

from pydantic import BaseModel


class ContainerObject(BaseModel):
    nested_objects: List[NestedObjectWithLiterals]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
