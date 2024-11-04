from pydantic import BaseModel
from resources.types.resources.object.types.object_with_optional_field import (
    ObjectWithOptionalField,
)


class NestedObjectWithRequiredField(BaseModel):
    string: str
    nested_object: ObjectWithOptionalField = Field(alias="NestedObject")
