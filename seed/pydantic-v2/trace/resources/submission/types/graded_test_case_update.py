from pydantic import BaseModel
from resources.submission.types.test_case_grade import TestCaseGrade


class GradedTestCaseUpdate(BaseModel):
    test_case_id: str = Field(alias="testCaseId")
    grade: TestCaseGrade
