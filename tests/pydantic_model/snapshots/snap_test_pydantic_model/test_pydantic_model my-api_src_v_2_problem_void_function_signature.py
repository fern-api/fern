import typing

import pydantic

from .parameter import Parameter


class VoidFunctionSignature(pydantic.BaseModel):
    parameters: typing.List[Parameter]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
