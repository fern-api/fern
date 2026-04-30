from pydantic import BaseModel
from resources.submission.types.test_case_result import TestCaseResult
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCaseResultWithStdout(BaseModel):
    result: TestCaseResult
    stdout: str
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

