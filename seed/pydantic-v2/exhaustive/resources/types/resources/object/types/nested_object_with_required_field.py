from pydantic import BaseModel
from resources.types.resources.object.types import ObjectWithOptionalField


class NestedObjectWithRequiredField(BaseModel):
    string: str
    nested_object: ObjectWithOptionalField
