from typing import Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.types.resources.object.types.object_with_optional_field import (
    ObjectWithOptionalField,
)

from pydantic import BaseModel


class NestedObjectWithOptionalField(BaseModel):
    string: Optional[str] = None
    nested_object: Optional[ObjectWithOptionalField]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
