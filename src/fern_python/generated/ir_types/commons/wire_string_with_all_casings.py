import typing

import pydantic

from .string_with_all_casings import StringWithAllCasings


class WireStringWithAllCasings(StringWithAllCasings):
    wire_value: str = pydantic.Field(alias="wireValue")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
