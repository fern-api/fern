import typing

import pydantic

from ..commons import WireStringWithAllCasings
from .single_union_type import SingleUnionType


class UnionTypeDeclaration(pydantic.BaseModel):
    discriminant: str
    discriminant_v2: WireStringWithAllCasings = pydantic.Field(alias="discriminantV2")
    types: typing.List[SingleUnionType]

    class Config:
        allow_population_by_field_name = True
