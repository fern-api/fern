import typing

import pydantic

from .declared_type_name import DeclaredTypeName
from .shape_type import ShapeType


class ResolvedNamedType(pydantic.BaseModel):
    name: DeclaredTypeName
    shape: ShapeType

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
