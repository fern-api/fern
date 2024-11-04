from pydantic import BaseModel
from typing import Optional
from resources.types.resources.object.types.object_with_optional_field import (
    ObjectWithOptionalField,
)


class NestedObjectWithOptionalField(BaseModel):
    string: Optional[str] = None
    nested_object: Optional[ObjectWithOptionalField] = Field(
        alias="NestedObject", default=None
    )
