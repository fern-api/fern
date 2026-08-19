from pydantic import BaseModel
from typing import Optional
from resources.commons.types.variable_value import VariableValue
from resources.submission.types.exception_v_2 import ExceptionV2
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCaseNonHiddenGrade(BaseModel):
    passed: bool
    actual_result: Optional[VariableValue] = 
    exception: Optional[ExceptionV2] = None
    stdout: str
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

