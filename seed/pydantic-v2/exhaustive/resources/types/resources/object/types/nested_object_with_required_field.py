from pydantic import BaseModel
from resources.types.resources.object.types.object_with_optional_field import (
    ObjectWithOptionalField,
)
from dt import datetime
from core.datetime_utils import serialize_datetime


class NestedObjectWithRequiredField(BaseModel):
    string: str
    nested_object: ObjectWithOptionalField

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
