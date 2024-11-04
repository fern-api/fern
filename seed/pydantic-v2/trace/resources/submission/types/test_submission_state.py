from pydantic import BaseModel
from typing import List
from resources.commons.types import TestCase
from resources.submission.types import TestSubmissionStatus


class TestSubmissionState(BaseModel):
    problem_id: str
    default_test_cases: List[TestCase]
    custom_test_cases: List[TestCase]
    status: TestSubmissionStatus
