import typing

import pydantic

from ..commons.variable_value import VariableValue
from .exception_v2 import ExceptionV2


class TestCaseNonHiddenGrade(pydantic.BaseModel):
    passed: bool
    actual_result: typing.Optional[VariableValue] = pydantic.Field(alias="actualResult")
    exception: typing.Optional[ExceptionV2]
    stdout: str

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
