import typing

import pydantic

from ..commons.with_docs import WithDocs
from .declared_type_name import DeclaredTypeName
from .type import Type


class TypeDeclaration(WithDocs):
    name: DeclaredTypeName
    shape: Type
    referenced_types: typing.List[DeclaredTypeName] = pydantic.Field(alias="referencedTypes")

    class Config:
        allow_population_by_field_name = True
