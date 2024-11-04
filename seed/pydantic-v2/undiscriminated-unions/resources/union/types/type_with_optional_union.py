from pydantic import BaseModel
from typing import Optional
from resources.union.types import MyUnion


class TypeWithOptionalUnion(BaseModel):
    my_union: Optional[MyUnion] = None
