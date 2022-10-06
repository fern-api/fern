import typing

import pydantic

from ..commons.with_docs import WithDocs
from .declared_type_name import DeclaredTypeName
from .type import Type


class TypeDeclaration(WithDocs):
    name: DeclaredTypeName
    shape: Type
    referenced_types: typing.List[DeclaredTypeName] = pydantic.Field(alias="referencedTypes")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
