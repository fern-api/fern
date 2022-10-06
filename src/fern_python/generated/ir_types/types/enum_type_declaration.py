import typing

import pydantic

from .enum_value import EnumValue


class EnumTypeDeclaration(pydantic.BaseModel):
    values: typing.List[EnumValue]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
