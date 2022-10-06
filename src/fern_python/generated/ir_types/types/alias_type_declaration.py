import typing

import pydantic

from .resolved_type_reference import ResolvedTypeReference
from .type_reference import TypeReference


class AliasTypeDeclaration(pydantic.BaseModel):
    alias_of: TypeReference = pydantic.Field(alias="aliasOf")
    resolved_type: ResolvedTypeReference = pydantic.Field(alias="resolvedType")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
