from pydantic import BaseModel
from resources.v_2.resources.problem.types import (
    NonVoidFunctionDefinition,
    AssertCorrectnessCheck,
)


class TestCaseWithActualResultImplementation(BaseModel):
    get_actual_result: NonVoidFunctionDefinition
    assert_correctness_check: AssertCorrectnessCheck
