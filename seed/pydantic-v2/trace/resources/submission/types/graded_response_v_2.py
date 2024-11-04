from pydantic import BaseModel
from uuid import UUID
from typing import Dict
from resources.submission.types.test_case_grade import TestCaseGrade


class GradedResponseV2(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    test_cases: Dict[str, TestCaseGrade] = Field(alias="testCases")
