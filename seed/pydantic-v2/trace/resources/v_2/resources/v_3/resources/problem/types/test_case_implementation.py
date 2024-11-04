from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types import (
    TestCaseImplementationDescription,
    TestCaseFunction,
)


class TestCaseImplementation(BaseModel):
    description: TestCaseImplementationDescription
    function: TestCaseFunction
