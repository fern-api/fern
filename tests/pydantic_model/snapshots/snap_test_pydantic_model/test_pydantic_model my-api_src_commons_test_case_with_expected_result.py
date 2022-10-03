import pydantic

from .test_case import TestCase
from .variable_value import VariableValue


class TestCaseWithExpectedResult(pydantic.BaseModel):
    test_case: TestCase = pydantic.Field(alias="testCase")
    expected_result: VariableValue = pydantic.Field(alias="expectedResult")

    class Config:
        allow_population_by_field_name = True
