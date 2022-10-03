import typing

import pydantic

from ...commons.string_with_all_casings import StringWithAllCasings
from ...commons.with_docs import WithDocs
from ...types.type_reference import TypeReference


class PathParameter(WithDocs):
    name: StringWithAllCasings
    value_type: TypeReference = pydantic.Field(alias="valueType")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
