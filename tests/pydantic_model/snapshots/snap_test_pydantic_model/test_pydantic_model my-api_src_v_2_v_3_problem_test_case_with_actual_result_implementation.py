import typing

import pydantic

from .assert_correctness_check import AssertCorrectnessCheck
from .non_void_function_definition import NonVoidFunctionDefinition


class TestCaseWithActualResultImplementation(pydantic.BaseModel):
    get_actual_result: NonVoidFunctionDefinition = pydantic.Field(alias="getActualResult")
    assert_correctness_check: AssertCorrectnessCheck = pydantic.Field(alias="assertCorrectnessCheck")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
