from pydantic import BaseModel
from uuid import UUID
from typing import Dict
from resources.submission.types.test_case_result_with_stdout import TestCaseResultWithStdout
from dt import datetime
from core.datetime_utils import serialize_datetime
class GradedResponse(BaseModel):
    submission_id: UUID = 
    test_cases: Dict[str, TestCaseResultWithStdout] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

