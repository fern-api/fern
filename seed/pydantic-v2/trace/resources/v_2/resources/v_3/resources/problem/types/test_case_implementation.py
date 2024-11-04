from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.test_case_implementation_description import (
    TestCaseImplementationDescription,
)
from resources.v_2.resources.v_3.resources.problem.types.test_case_function import (
    TestCaseFunction,
)


class TestCaseImplementation(BaseModel):
    description: TestCaseImplementationDescription
    function: TestCaseFunction
