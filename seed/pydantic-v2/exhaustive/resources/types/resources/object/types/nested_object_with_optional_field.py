from pydantic import BaseModel
from typing import Optional
from resources.types.resources.object.types.object_with_optional_field import (
    ObjectWithOptionalField,
)
from dt import datetime
from core.datetime_utils import serialize_datetime


class NestedObjectWithOptionalField(BaseModel):
    string: Optional[str] = None
    nested_object: Optional[ObjectWithOptionalField]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
