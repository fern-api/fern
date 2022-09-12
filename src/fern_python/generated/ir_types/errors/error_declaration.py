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
    http: typing.Optional[HttpErrorConfiguration]
