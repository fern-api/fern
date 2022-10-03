import typing

import pydantic

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from ..commons.with_docs import WithDocs
from ..types.type import Type
from .declared_error_name import DeclaredErrorName
from .http_error_configuration import HttpErrorConfiguration


class ErrorDeclaration(WithDocs):
    name: DeclaredErrorName
    discriminant_value: WireStringWithAllCasings = pydantic.Field(alias="discriminantValue")
    type: Type
    type_v_2: typing.Optional[Type] = pydantic.Field(alias="typeV2")
    http: typing.Optional[HttpErrorConfiguration]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
