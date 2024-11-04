from pydantic import BaseModel
from resources.commons.types.test_case import TestCase
from resources.commons.types.variable_value import VariableValue


class TestCaseWithExpectedResult(BaseModel):
    test_case: TestCase = Field(alias="testCase")
    expected_result: VariableValue = Field(alias="expectedResult")
