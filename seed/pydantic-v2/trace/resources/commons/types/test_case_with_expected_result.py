from pydantic import BaseModel
from resources.commons.types import TestCase, VariableValue


class TestCaseWithExpectedResult(BaseModel):
    test_case: TestCase
    expected_result: VariableValue
