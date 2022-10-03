import typing

import pydantic

from ..commons.variable_value import VariableValue
from .actual_result import ActualResult


class TestCaseResult(pydantic.BaseModel):
    expected_result: VariableValue = pydantic.Field(alias="expectedResult")
    actual_result: ActualResult = pydantic.Field(alias="actualResult")
    passed: bool

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
