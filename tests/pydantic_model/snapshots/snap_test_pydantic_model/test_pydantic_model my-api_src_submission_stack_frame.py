import typing

import pydantic

from .scope import Scope


class StackFrame(pydantic.BaseModel):
    method_name: str = pydantic.Field(alias="methodName")
    line_number: int = pydantic.Field(alias="lineNumber")
    scopes: typing.List[Scope]

    class Config:
        allow_population_by_field_name = True
