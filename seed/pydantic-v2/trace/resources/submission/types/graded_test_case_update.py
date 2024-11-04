from pydantic import BaseModel
from resources.submission.types import TestCaseGrade


class GradedTestCaseUpdate(BaseModel):
    test_case_id: str
    grade: TestCaseGrade
