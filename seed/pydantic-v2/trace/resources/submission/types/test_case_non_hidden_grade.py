from pydantic import BaseModel
from typing import Optional
from resources.commons.types.variable_value import VariableValue
from resources.submission.types.exception_v_2 import ExceptionV2


class TestCaseNonHiddenGrade(BaseModel):
    passed: bool
    actual_result: Optional[VariableValue] = Field(alias="actualResult", default=None)
    exception: Optional[ExceptionV2] = None
    stdout: str
