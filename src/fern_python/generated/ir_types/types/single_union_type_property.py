import typing

import pydantic

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from .type_reference import TypeReference


class SingleUnionTypeProperty(pydantic.BaseModel):
    name: WireStringWithAllCasings
    type: TypeReference

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
