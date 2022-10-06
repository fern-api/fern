import typing

import pydantic

from ...commons.wire_string_with_all_casings import WireStringWithAllCasings
from ...commons.with_docs import WithDocs
from .response_error_shape import ResponseErrorShape


class ResponseErrorV2(WithDocs):
    discriminant_value: WireStringWithAllCasings = pydantic.Field(alias="discriminantValue")
    shape: ResponseErrorShape

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
