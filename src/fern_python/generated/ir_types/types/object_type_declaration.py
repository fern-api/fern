import typing

import pydantic

from .declared_type_name import DeclaredTypeName
from .object_property import ObjectProperty


class ObjectTypeDeclaration(pydantic.BaseModel):
    extends: typing.List[DeclaredTypeName]
    properties: typing.List[ObjectProperty]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
