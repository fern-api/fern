import typing

import pydantic

from .variable_value import VariableValue


class TestCase(pydantic.BaseModel):
    id: str
    params: typing.List[VariableValue]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
