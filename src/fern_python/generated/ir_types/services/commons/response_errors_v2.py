import typing

import pydantic

from ...commons.wire_string_with_all_casings import WireStringWithAllCasings
from .response_error_v2 import ResponseErrorV2


class ResponseErrorsV2(pydantic.BaseModel):
    discriminant: WireStringWithAllCasings
    types: typing.List[ResponseErrorV2]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
