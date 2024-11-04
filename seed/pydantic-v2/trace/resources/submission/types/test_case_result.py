from pydantic import BaseModel
from resources.commons.types import VariableValue
from resources.submission.types import ActualResult


class TestCaseResult(BaseModel):
    expected_result: VariableValue
    actual_result: ActualResult
    passed: bool
