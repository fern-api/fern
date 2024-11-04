from pydantic import BaseModel
from typing import List
from resources.commons.types.test_case import TestCase
from resources.submission.types.test_submission_status import TestSubmissionStatus


class TestSubmissionState(BaseModel):
    problem_id: str = Field(alias="problemId")
    default_test_cases: List[TestCase] = Field(alias="defaultTestCases")
    custom_test_cases: List[TestCase] = Field(alias="customTestCases")
    status: TestSubmissionStatus
