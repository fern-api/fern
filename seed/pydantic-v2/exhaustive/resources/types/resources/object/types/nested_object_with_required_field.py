from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.types.resources.object.types.object_with_optional_field import (
    ObjectWithOptionalField,
)

from pydantic import BaseModel


class NestedObjectWithRequiredField(BaseModel):
    string: str
    nested_object: ObjectWithOptionalField

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
