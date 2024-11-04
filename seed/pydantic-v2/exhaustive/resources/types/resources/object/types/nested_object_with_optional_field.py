from pydantic import BaseModel
from typing import Optional
from resources.types.resources.object.types import ObjectWithOptionalField


class NestedObjectWithOptionalField(BaseModel):
    string: Optional[str] = None
    nested_object: Optional[ObjectWithOptionalField] = None
