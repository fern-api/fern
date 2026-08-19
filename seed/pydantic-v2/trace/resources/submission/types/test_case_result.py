from pydantic import BaseModel
from resources.commons.types.variable_value import VariableValue
from resources.submission.types.actual_result import ActualResult
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCaseResult(BaseModel):
    expected_result: VariableValue = 
    actual_result: ActualResult = 
    passed: bool
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

