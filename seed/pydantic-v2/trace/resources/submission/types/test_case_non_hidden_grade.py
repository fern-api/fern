from pydantic import BaseModel
from typing import Optional
from resources.commons.types import VariableValue
from resources.submission.types import ExceptionV2


class TestCaseNonHiddenGrade(BaseModel):
    passed: bool
    actual_result: Optional[VariableValue] = None
    exception: Optional[ExceptionV2] = None
    stdout: str
