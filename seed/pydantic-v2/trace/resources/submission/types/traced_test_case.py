from pydantic import BaseModel
from resources.submission.types.test_case_result_with_stdout import TestCaseResultWithStdout
from dt import datetime
from core.datetime_utils import serialize_datetime
class TracedTestCase(BaseModel):
    result: TestCaseResultWithStdout
    trace_responses_size: int = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

