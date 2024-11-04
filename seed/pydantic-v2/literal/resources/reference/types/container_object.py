from pydantic import BaseModel
from typing import List
from resources.reference.types import NestedObjectWithLiterals


class ContainerObject(BaseModel):
    nested_objects: List[NestedObjectWithLiterals]
