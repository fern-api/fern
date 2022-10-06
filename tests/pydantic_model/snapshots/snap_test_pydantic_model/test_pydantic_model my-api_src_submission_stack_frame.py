import typing

import pydantic

from .scope import Scope


class StackFrame(pydantic.BaseModel):
    method_name: str = pydantic.Field(alias="methodName")
    line_number: int = pydantic.Field(alias="lineNumber")
    scopes: typing.List[Scope]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
