import typing

import pydantic

from ...commons.wire_string_with_all_casings import WireStringWithAllCasings
from ...errors.declared_error_name import DeclaredErrorName


class SingleResponseErrorProperty(pydantic.BaseModel):
    name: WireStringWithAllCasings
    error: DeclaredErrorName

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
