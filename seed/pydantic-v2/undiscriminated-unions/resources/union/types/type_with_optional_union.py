from pydantic import BaseModel
from typing import Optional
from resources.union.types.my_union import MyUnion


class TypeWithOptionalUnion(BaseModel):
    my_union: Optional[MyUnion] = Field(alias="myUnion", default=None)
