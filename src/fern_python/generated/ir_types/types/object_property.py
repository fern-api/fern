import typing

import pydantic

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from ..commons.with_docs import WithDocs
from .type_reference import TypeReference


class ObjectProperty(WithDocs):
    name: WireStringWithAllCasings
    value_type: TypeReference = pydantic.Field(alias="valueType")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
