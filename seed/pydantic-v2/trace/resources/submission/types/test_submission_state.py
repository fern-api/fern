from pydantic import BaseModel
from typing import List
from resources.commons.types.test_case import TestCase
from resources.submission.types.test_submission_status import TestSubmissionStatus
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestSubmissionState(BaseModel):
    problem_id: str = 
    default_test_cases: List[TestCase] = 
    custom_test_cases: List[TestCase] = 
    status: TestSubmissionStatus
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

