from pydantic import BaseModel
from resources.commons.types.variable_value import VariableValue
from resources.submission.types.actual_result import ActualResult


class TestCaseResult(BaseModel):
    expected_result: VariableValue = Field(alias="expectedResult")
    actual_result: ActualResult = Field(alias="actualResult")
    passed: bool
