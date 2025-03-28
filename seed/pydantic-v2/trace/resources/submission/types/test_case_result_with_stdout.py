from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.submission.types.test_case_result import TestCaseResult

from pydantic import BaseModel


class TestCaseResultWithStdout(BaseModel):
    result: TestCaseResult
    stdout: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
