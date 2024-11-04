from pydantic import BaseModel
from resources.v_2.resources.problem.types.non_void_function_definition import (
    NonVoidFunctionDefinition,
)
from resources.v_2.resources.problem.types.assert_correctness_check import (
    AssertCorrectnessCheck,
)


class TestCaseWithActualResultImplementation(BaseModel):
    get_actual_result: NonVoidFunctionDefinition = Field(alias="getActualResult")
    assert_correctness_check: AssertCorrectnessCheck = Field(
        alias="assertCorrectnessCheck"
    )
