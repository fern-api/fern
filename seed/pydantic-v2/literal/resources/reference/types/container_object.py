from pydantic import BaseModel
from typing import List
from resources.reference.types.nested_object_with_literals import (
    NestedObjectWithLiterals,
)


class ContainerObject(BaseModel):
    nested_objects: List[NestedObjectWithLiterals] = Field(alias="nestedObjects")
