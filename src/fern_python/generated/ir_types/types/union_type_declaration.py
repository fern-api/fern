import typing

import pydantic

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from .single_union_type import SingleUnionType


class UnionTypeDeclaration(pydantic.BaseModel):
    discriminant: str
    discriminant_v_2: WireStringWithAllCasings = pydantic.Field(alias="discriminantV2")
    types: typing.List[SingleUnionType]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
