import typing

import pydantic

from ...commons.with_docs import WithDocs
from ...types.type_reference import TypeReference


class HttpRequest(WithDocs):
    type: TypeReference
    type_v_2: typing.Optional[TypeReference] = pydantic.Field(alias="typeV2")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
